"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCloudClient } from "../lib/supabase-client";
import {
  collectWorkspace,
  validateEnvelope,
  workspaceFingerprint,
  planSync,
  makeOutbox,
  queueLatestDraft,
  validateOutbox,
  restoreWorkspace,
  isolateAccountWorkspace,
} from "../lib/cloud-workspace.mjs";
import type { CloudRecord } from "../lib/cloud-workspace.mjs";
export function CloudAutosaveBridge() {
  const pathname = usePathname();
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (pathname.startsWith("/account")) return;
    const client = getCloudClient();
    if (!client) return;
    let alive = true,
      working = false,
      accountId: string | null = null,
      suspended = false;
    async function identify() {
      const { data, error } = await client!.auth.getUser();
      if (!alive) return;
      const owner = localStorage.getItem("bindforge-nw:cloud-owner");
      if (error) {
        if (!navigator.onLine) {
          accountId = owner;
          return;
        }
        if (error.name !== "AuthSessionMissingError") {
          accountId = null;
          setMessage(
            "Account verification unavailable — local changes retained",
          );
          return;
        }
      }
      const nextId = data.user?.id ?? null;
      if (owner && owner !== nextId) {
        isolateAccountWorkspace(localStorage, owner);
        location.reload();
        return;
      }
      accountId = nextId;
    }
    async function sync() {
      if (!alive || working || suspended || !accountId) return;
      working = true;
      const owner = accountId;
      try {
        if (localStorage.getItem("bindforge-nw:cloud-owner") !== owner) {
          setMessage("Review account data before syncing.");
          return;
        }
        const key = `bindforge-nw:cloud-meta:${owner}`,
          meta = JSON.parse(localStorage.getItem(key) || "null");
        if (!meta?.approved) return;
        const local = collectWorkspace(localStorage),
          queue = `bindforge-nw:cloud-outbox:${owner}`;
        if (!navigator.onLine) {
          localStorage.setItem(
            queue,
            JSON.stringify(
              queueLatestDraft(
                owner,
                local,
                meta.baseRevision ?? 0,
                JSON.parse(localStorage.getItem(queue) || "null"),
              ),
            ),
          );
          setMessage("Offline — changes queued");
          return;
        }
        const verified = await client!.auth.getUser();
        if (verified.error || verified.data.user?.id !== owner) {
          suspended = true;
          await identify();
          return;
        }
        const raw = localStorage.getItem(queue),
          pending = raw ? validateOutbox(JSON.parse(raw), owner) : null;
        if (pending && !pending.ok) {
          suspended = true;
          setMessage(
            "Invalid pending copy — export or recover it before syncing",
          );
          return;
        }
        const { data, error } = await client!
          .from("bindforge_workspaces")
          .select("revision,document")
          .eq("user_id", owner)
          .maybeSingle();
        if (error) throw error;
        if (!alive || accountId !== owner) return;
        const remote = data as CloudRecord | null;
        if (remote && !validateEnvelope(remote.document).ok)
          throw Error("Cloud data could not be validated");
        const plan = planSync({
          local,
          remote,
          baseRevision: pending?.ok
            ? pending.value.baseRevision
            : meta.baseRevision,
          baseFingerprint: meta.baseFingerprint,
          migrationApproved: true,
        });
        if (plan.action === "current") {
          localStorage.setItem(
            key,
            JSON.stringify({
              approved: true,
              baseRevision: plan.revision,
              baseFingerprint: workspaceFingerprint(local),
            }),
          );
          localStorage.removeItem(queue);
          setMessage("Cloud saved");
          return;
        }
        if (plan.action === "download" && remote) {
          if (
            workspaceFingerprint(collectWorkspace(localStorage)) !==
            workspaceFingerprint(local)
          ) {
            setMessage(
              "New local edits detected — checking again before loading cloud data",
            );
            return;
          }
          restoreWorkspace(localStorage, remote.document);
          localStorage.setItem(
            key,
            JSON.stringify({
              approved: true,
              baseRevision: remote.revision,
              baseFingerprint: workspaceFingerprint(remote.document),
            }),
          );
          location.reload();
          return;
        }
        if (plan.action !== "upload") {
          suspended = true;
          setMessage("Cloud conflict — review both versions");
          return;
        }
        localStorage.setItem(
          queue,
          JSON.stringify(makeOutbox(owner, local, plan.revision ?? 0)),
        );
        setMessage("Saving…");
        const result = await client!.rpc("bindforge_save_workspace", {
          expected_user_id: owner,
          expected_revision: plan.revision ?? 0,
          workspace_document: local,
        });
        if (result.error) throw result.error;
        if (!alive || accountId !== owner) return;
        localStorage.setItem(
          key,
          JSON.stringify({
            approved: true,
            baseRevision: Number(result.data),
            baseFingerprint: workspaceFingerprint(local),
          }),
        );
        const latest = collectWorkspace(localStorage);
        if (workspaceFingerprint(latest) === workspaceFingerprint(local))
          localStorage.removeItem(queue);
        else
          localStorage.setItem(
            queue,
            JSON.stringify(makeOutbox(owner, latest, Number(result.data))),
          );
        setMessage("Cloud saved");
      } catch {
        if (alive) setMessage("Cloud save failed — local copy retained");
      } finally {
        working = false;
      }
    }
    const start = setTimeout(() => {
        void identify().then(sync);
      }, 0),
      timer = setInterval(() => void sync(), 5000);
    const online = () => void sync();
    const changed = (e: StorageEvent) => {
      if (e.key === "bindforge-nw:cloud-owner") {
        location.reload();
        return;
      }
      if (
        e.key?.startsWith("bindforge-nw:") &&
        !e.key.includes("cloud-outbox")
      ) {
        suspended = true;
        setMessage("Setup changed in another tab — reload before syncing");
      }
    };
    const sub = client.auth.onAuthStateChange((event, session) => {
      setTimeout(() => {
        if (!alive) return;
        if (event === "SIGNED_OUT") {
          accountId = null;
          suspended = true;
          const owner = localStorage.getItem("bindforge-nw:cloud-owner");
          if (owner) {
            isolateAccountWorkspace(localStorage, owner);
            location.reload();
          }
          return;
        }
        if (accountId && session?.user.id !== accountId) {
          suspended = true;
          setMessage("Account changed — review before syncing");
        }
        void identify();
      }, 0);
    });
    window.addEventListener("online", online);
    window.addEventListener("storage", changed);
    return () => {
      alive = false;
      clearTimeout(start);
      clearInterval(timer);
      window.removeEventListener("online", online);
      window.removeEventListener("storage", changed);
      sub.data.subscription.unsubscribe();
    };
  }, [pathname]);
  return message ? (
    <p
      className="cloud-status"
      role="status"
      aria-live="polite"
      style={{ padding: "12px 20px", fontSize: "1rem", margin: 0 }}
    >
      <a href="/account">{message}</a>
    </p>
  ) : null;
}
