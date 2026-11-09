"use client";

import {EmailAccountAccess} from "./EmailAccountAccess";
import { useCallback, useEffect, useRef, useState } from "react";
import { cloudUrl, cloudPublishableKey } from "../lib/cloud-config";
import type { User } from "@supabase/supabase-js";
import { getCloudClient, cloudIsConfigured } from "../lib/supabase-client";
import {
  CLOUD_DOCUMENT_KEYS,
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
import type {
  CloudRecord,
  WorkspaceEnvelope,
} from "../lib/cloud-workspace.mjs";
import styles from "./CloudWorkspacePanel.module.css";

const OWNER_KEY = "bindforge-nw:cloud-owner";
const metaKey = (id: string) => `bindforge-nw:cloud-meta:${id}`;
const queueKey = (id: string) => `bindforge-nw:cloud-outbox:${id}`;
type Meta = {
  approved: boolean;
  baseRevision: number | null;
  baseFingerprint?: string;
};
function readMeta(id: string): Meta {
  try {
    const value = JSON.parse(localStorage.getItem(metaKey(id)) || "null");
    return {
      approved: value?.approved === true,
      baseRevision:
        Number.isSafeInteger(value?.baseRevision) && value.baseRevision >= 0
          ? value.baseRevision
          : null,
      baseFingerprint:
        typeof value?.baseFingerprint === "string"
          ? value.baseFingerprint
          : undefined,
    };
  } catch {
    return { approved: false, baseRevision: null };
  }
}
function download(value: unknown, name: string) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function CloudWorkspacePanel() {
  const [user, setUser] = useState<User | null>(null),
    [status, setStatus] = useState("Checking account…"),
    [email, setEmail] = useState(""),
    [busy, setBusy] = useState(false),
    [remote, setRemote] = useState<CloudRecord | null>(null),
    [review, setReview] = useState(false),
    [conflict, setConflict] = useState(false),
    [approved, setApproved] = useState(false),
    [deleteText, setDeleteText] = useState(""),
    [history, setHistory] = useState<CloudRecord[]>([]);
  const busyRef = useRef(false),
    lastSeen = useRef(""),
    userRef = useRef<User | null>(null),
    mounted = useRef(true);
  const configured = cloudIsConfigured();
  const [emailReady, setEmailReady] = useState(false);
  const [googleReady, setGoogleReady] = useState(false),
    [providerMessage, setProviderMessage] = useState(
      "Checking sign-in availability…",
    );
  useEffect(() => {
    let active = true;
    void fetch(cloudUrl + "/auth/v1/settings", {
      headers: { apikey: cloudPublishableKey },
    })
      .then(async (response) => {
        if (!response.ok) throw Error();
        return response.json();
      })
      .then((settings) => {
        if (active) {
          setGoogleReady(settings.external?.google === true);
          setEmailReady(settings.external?.email === true);
          setProviderMessage(
            settings.external?.google === true
              ? "Google sign-in is available."
              : "Google sign-in is awaiting the site owner’s OAuth configuration. Guest tools remain available.",
          );
        }
      })
      .catch(() => {
        if (active)
          setProviderMessage(
            "Could not check Google sign-in. Try reloading after checking your connection.",
          );
      });
    const params = new URLSearchParams(
      location.hash.replace(/^#/, "") || location.search,
    );
    const error = params.get("error_description");
    if (error)
      queueMicrotask(() => {
        if (active)
          setStatus("Sign-in did not complete: " + error.slice(0, 300));
      });
    return () => {
      active = false;
    };
  }, []);
  const readRemote = useCallback(async (id: string) => {
    const client = getCloudClient();
    if (!client) throw Error("Cloud configuration is missing.");
    const { data, error } = await client
      .from("bindforge_workspaces")
      .select("revision,document,updated_at")
      .eq("user_id", id)
      .maybeSingle();
    if (error) throw Error(error.message);
    if (data && !validateEnvelope(data.document).ok)
      throw Error("Cloud workspace failed validation. Nothing was imported.");
    return data as CloudRecord | null;
  }, []);
  const refresh = useCallback(async () => {
    const client = getCloudClient();
    if (!client) {
      setStatus(
        "Cloud accounts are not configured. Guest browsing, building and copying remain available.",
      );
      return;
    }
    const { data, error } = await client.auth.getUser();
    if (!mounted.current) return;
    if (error || !data.user) {
      const oldOwner = localStorage.getItem(OWNER_KEY);
      if (oldOwner && (!error || error.name === "AuthSessionMissingError")) {
        isolateAccountWorkspace(localStorage, oldOwner);
        location.reload();
        return;
      }
      userRef.current = null;
      setUser(null);
      const params = new URLSearchParams(
        location.hash.replace(/^#/, "") || location.search,
      );
      const callbackError = params.get("error_description");
      setStatus(
        callbackError
          ? "Sign-in did not complete: " + callbackError.slice(0, 300)
          : "Guest mode — sign in to review cloud saving.",
      );
      return;
    }
    const current = data.user;
    try {
      const owner = localStorage.getItem(OWNER_KEY);
      if (owner && owner !== current.id) {
        isolateAccountWorkspace(localStorage, owner);
        window.location.reload();
        return;
      }
      userRef.current = current;
      setUser(current);
      const meta = readMeta(current.id);
      setApproved(meta.approved && owner === current.id);
      const cloud = await readRemote(current.id);
      setRemote(cloud);
      setReview(!meta.approved || owner !== current.id);
      setStatus(
        meta.approved && owner === current.id
          ? "Cloud workspace ready. Changes sync when the workbench is open."
          : "Review your local and cloud workspace before enabling sync. Nothing has been uploaded automatically.",
      );
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Cloud account could not load.",
      );
    }
  }, [readRemote]);
  useEffect(() => {
    mounted.current = true;
    let alive = true;
    const timer = setTimeout(() => {
      if (alive) void refresh();
    }, 0);
    const client = getCloudClient();
    const subscription = client?.auth.onAuthStateChange(() => {
      setTimeout(() => {
        if (alive) void refresh();
      }, 0);
    });
    return () => {
      alive = false;
      mounted.current = false;
      clearTimeout(timer);
      subscription?.data.subscription.unsubscribe();
    };
  }, [refresh]);
  const loadCloudWorkspace = useCallback(
    async (
      document: WorkspaceEnvelope,
      revision: number,
      source: "cloud" | "recovery" = "cloud",
    ) => {
      const user = userRef.current;
      if (!user) return;
      try {
        download(
          collectWorkspace(localStorage),
          "bindforge-before-cloud-restore.json",
        );
        restoreWorkspace(localStorage, document);
        localStorage.setItem(OWNER_KEY, user.id);
        localStorage.setItem(
          metaKey(user.id),
          JSON.stringify({
            approved: source === "cloud",
            baseRevision: revision,
            baseFingerprint:
              source === "cloud" ? workspaceFingerprint(document) : undefined,
          }),
        );
        if (source === "cloud") localStorage.removeItem(queueKey(user.id));
        location.reload();
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Restore failed.");
      }
    },
    [],
  );
  const sync = useCallback(async () => {
    const current = userRef.current,
      client = getCloudClient();
    if (!current || !client || busyRef.current) return;
    const meta = readMeta(current.id);
    if (!meta.approved || localStorage.getItem(OWNER_KEY) !== current.id)
      return;
    busyRef.current = true;
    try {
      const local = collectWorkspace(localStorage),
        fingerprint = workspaceFingerprint(local);
      const raw = localStorage.getItem(queueKey(current.id));
      const pending = raw ? validateOutbox(JSON.parse(raw), current.id) : null;
      if (pending && !pending.ok)
        throw Error(
          "Pending save is invalid or belongs to another account. Export your local workspace before repairing it.",
        );
      if (!navigator.onLine) {
        localStorage.setItem(
          queueKey(current.id),
          JSON.stringify(
            queueLatestDraft(
              current.id,
              local,
              meta.baseRevision ?? 0,
              raw ? JSON.parse(raw) : null,
            ),
          ),
        );
        setStatus(
          "Offline — changes are queued for this account on this browser.",
        );
        return;
      }
      const cloud = await readRemote(current.id);
      if (userRef.current?.id !== current.id) return;
      setRemote(cloud);
      const plan = planSync({
        local,
        remote: cloud,
        baseRevision: pending?.ok
          ? pending.value.baseRevision
          : meta.baseRevision,
        baseFingerprint: meta.baseFingerprint,
        migrationApproved: true,
      });
      if (plan.action === "current") {
        localStorage.setItem(
          metaKey(current.id),
          JSON.stringify({
            approved: true,
            baseRevision: plan.revision,
            baseFingerprint: fingerprint,
          }),
        );
        localStorage.removeItem(queueKey(current.id));
        lastSeen.current = fingerprint;
        setConflict(false);
        setStatus("Saved — local and cloud workspace match.");
        return;
      }
      if (plan.action === "download" && cloud) {
        if (
          workspaceFingerprint(collectWorkspace(localStorage)) !== fingerprint
        ) {
          setStatus(
            "New local edits detected. Sync will check again before loading cloud data.",
          );
          return;
        }
        await loadCloudWorkspace(cloud.document, cloud.revision);
        return;
      }
      if (plan.action !== "upload") {
        setConflict(true);
        setStatus(
          "Conflict: the cloud has a different revision. Review both copies; no overwrite was made.",
        );
        return;
      }
      // Persist before the network request. Keep it on failures; CAS protects against an old device.
      const queued = makeOutbox(current.id, local, plan.revision ?? 0);
      localStorage.setItem(queueKey(current.id), JSON.stringify(queued));
      setStatus("Saving…");
      const { data, error } = await client.rpc("bindforge_save_workspace", {
        expected_user_id: current.id,
        expected_revision: queued.baseRevision,
        workspace_document: local,
      });
      if (error) {
        if (error.code === "40001") setConflict(true);
        throw Error(error.message);
      }
      if (userRef.current?.id !== current.id) return;
      localStorage.setItem(
        metaKey(current.id),
        JSON.stringify({
          approved: true,
          baseRevision: Number(data),
          baseFingerprint: fingerprint,
        }),
      );
      const latest = collectWorkspace(localStorage);
      if (workspaceFingerprint(latest) === fingerprint)
        localStorage.removeItem(queueKey(current.id));
      else
        localStorage.setItem(
          queueKey(current.id),
          JSON.stringify(makeOutbox(current.id, latest, Number(data))),
        );
      lastSeen.current = fingerprint;
      setRemote({ revision: Number(data), document: local });
      setConflict(false);
      setStatus("Saved to your account.");
    } catch (error) {
      setStatus(
        `Save not completed: ${error instanceof Error ? error.message : "network error"}. Pending changes remain on this browser.`,
      );
    } finally {
      busyRef.current = false;
    }
  }, [readRemote, loadCloudWorkspace]);
  useEffect(() => {
    if (!approved || !user) return;
    const run = () => {
      void sync();
    };
    const tick = setInterval(run, 5000);
    window.addEventListener("online", run);
    const changed = (e: StorageEvent) => {
      if (e.key && CLOUD_DOCUMENT_KEYS.includes(e.key)) run();
    };
    window.addEventListener("storage", changed);
    run();
    return () => {
      clearInterval(tick);
      window.removeEventListener("online", run);
      window.removeEventListener("storage", changed);
    };
  }, [approved, user, sync]);
  async function login(provider: "google" | "email") {
    const client = getCloudClient();
    if (!client) return;
    setBusy(true);
    const callback = new URL("/account", location.origin).toString();
    try {
      if (provider === "google") {
        const { error } = await client.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: callback, scopes: "openid email profile" },
        });
        if (error) throw error;
      } else {
        const { error } = await client.auth.signInWithOtp({
          email: email.trim(),
          options: { emailRedirectTo: callback },
        });
        if (error) throw error;
        setStatus(
          "If the address is eligible, a sign-in link has been sent. Check your email.",
        );
      }
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Sign-in could not start.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function enable() {
    if (!user) return;
    try {
      collectWorkspace(localStorage);
      localStorage.removeItem(queueKey(user.id));
      localStorage.setItem(OWNER_KEY, user.id);
      localStorage.setItem(
        metaKey(user.id),
        JSON.stringify({ approved: true, baseRevision: remote?.revision ?? 0 }),
      );
      setApproved(true);
      setReview(false);
      await sync();
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Could not enable saving.",
      );
    }
  }

  async function signOut() {
    const client = getCloudClient();
    if (!client || !user) return;
    setBusy(true);
    try {
      if (busyRef.current)
        throw Error(
          "A save is in progress. Try signing out again after it finishes.",
        );
      const verified = await client.auth.getUser();
      if (verified.data.user?.id !== user.id)
        throw Error("Account changed. Reload before continuing.");
      const { error } = await client.auth.signOut();
      if (error) throw error;
      userRef.current = null;
      if (localStorage.getItem(OWNER_KEY) === user.id) {
        isolateAccountWorkspace(localStorage, user.id);
      }
      location.reload();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Sign-out failed.");
    } finally {
      setBusy(false);
    }
  }
  async function deleteAccount() {
    const client = getCloudClient();
    if (!client || !user || deleteText !== "DELETE MY ACCOUNT") return;
    setBusy(true);
    try {
      if (busyRef.current)
        throw Error("Wait for the current save to finish before deleting.");
      download(
        collectWorkspace(localStorage),
        "bindforge-account-before-delete.json",
      );
      const { error } = await client.rpc("bindforge_delete_my_account", {
        expected_user_id: user.id,
      });
      if (error) throw error;
      userRef.current = null;
      await client.auth.signOut({ scope: "local" });
      if (localStorage.getItem(OWNER_KEY) === user.id) {
        isolateAccountWorkspace(localStorage, user.id);
      }
      localStorage.removeItem(metaKey(user.id));
      localStorage.removeItem(queueKey(user.id));
      localStorage.removeItem(`bindforge-nw:cloud-quarantine:${user.id}`);
      localStorage.removeItem(`bindforge-nw:cloud-recovery:${user.id}`);
      localStorage.removeItem(OWNER_KEY);
      location.reload();
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Account deletion did not complete.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function loadHistory() {
    const client = getCloudClient();
    if (!client || !user) return;
    const { data, error } = await client
      .from("bindforge_workspace_history")
      .select("revision,document,created_at")
      .eq("user_id", user.id)
      .order("revision", { ascending: false })
      .limit(50);
    if (error) setStatus(error.message);
    else setHistory((data ?? []) as CloudRecord[]);
  }
  return (
    <section className={styles.root} aria-labelledby="cloud-account-title">
      <h1 id="cloud-account-title">Your account & cloud workspace</h1>
      <p>
        Keep planned keybinds, selected keys, characters, collections,
        combinations and reading preferences together. Cloud saving cannot read
        or apply your live Neverwinter bindings.
      </p>
      <p className={styles.status} role="status" aria-live="polite">
        {status}
      </p>
      {user?<EmailAccountAccess enabled={configured&&emailReady} onAuthenticated={refresh} onStatus={setStatus} recoveryOnly/>:null}
      {!user ? (
        <>
          <EmailAccountAccess enabled={configured&&emailReady} onAuthenticated={refresh} onStatus={setStatus}/>
          <details className={styles.section}><summary>Other sign-in options</summary>
          <div className={styles.actions}>
            <button
              type="button"
              disabled={!configured || busy || !googleReady}
              onClick={() => void login("google")}
            >
              Continue with Google
            </button>
          </div>
          <p role="status">{providerMessage}</p>
          <label htmlFor="account-email">Email sign-in link</label>
          <input
            id="account-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className={styles.actions}>
            <button
              type="button"
              disabled={
                !configured ||
                !emailReady ||
                busy ||
                !/^\S+@\S+\.\S+$/.test(email)
              }
              onClick={() => void login("email")}
            >
              Email me a sign-in link
            </button>
          </div>
          </details>
          {!configured ? (
            <p>
              Backend setup is required before accounts are available. The local
              workbench remains usable.
            </p>
          ) : null}
        </>
      ) : (
        <>
          <p>
            Signed in as {user.email ?? "your account"}.{" "}
            {remote
              ? `Cloud revision ${remote.revision}.`
              : "No cloud workspace saved yet."}
          </p>
          {review || conflict ? (
            <div className={styles.section}>
              <h2>
                {conflict
                  ? "Resolve the workspace difference"
                  : "Review before enabling sync"}
              </h2>
              <p>
                Download both copies before choosing. Keeping this browser copy
                writes a new revision only if the reviewed cloud revision is
                still current. Loading the cloud copy replaces local product
                documents and reloads the workbench.
              </p>
              <div className={styles.actions}>
                <button
                  onClick={() =>
                    download(
                      collectWorkspace(localStorage),
                      "bindforge-local-workspace.json",
                    )
                  }
                >
                  Export local copy
                </button>
                {remote ? (
                  <button
                    onClick={() =>
                      download(remote, "bindforge-cloud-workspace.json")
                    }
                  >
                    Export cloud copy
                  </button>
                ) : null}
                <button disabled={busy} onClick={() => void enable()}>
                  {remote
                    ? "Keep this browser copy"
                    : "Save this browser workspace"}
                </button>
                {remote ? (
                  <button
                    disabled={busy}
                    onClick={() =>
                      void loadCloudWorkspace(remote.document, remote.revision)
                    }
                  >
                    Load reviewed cloud copy
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
          <details className={styles.section}>
            <summary>Recover this account’s browser copies</summary>
            <p>
              Recovering replaces the visible workbench after preparing a
              backup. Cloud revision checks still apply.
            </p>
            {["cloud-outbox", "cloud-quarantine"].map((kind) => (
              <div className={styles.actions} key={kind}>
                <button
                  onClick={() => {
                    try {
                      const raw = JSON.parse(
                        localStorage.getItem(
                          `bindforge-nw:${kind}:${user.id}`,
                        ) || "null",
                      );
                      if (!raw) {
                        setStatus("No recovery copy stored.");
                        return;
                      }
                      download(raw, `bindforge-${kind}.json`);
                    } catch {
                      setStatus("Recovery copy could not be read.");
                    }
                  }}
                >
                  Export{" "}
                  {kind === "cloud-outbox" ? "pending save" : "sign-out copy"}
                </button>
                <button
                  onClick={() => {
                    try {
                      const raw = JSON.parse(
                        localStorage.getItem(
                          `bindforge-nw:${kind}:${user.id}`,
                        ) || "null",
                      );
                      const doc = kind === "cloud-outbox" ? raw?.envelope : raw;
                      if (!validateEnvelope(doc).ok)
                        throw Error(
                          "No valid recovery copy is available. Export it for manual recovery.",
                        );
                      void loadCloudWorkspace(
                        doc,
                        kind === "cloud-outbox"
                          ? raw.baseRevision
                          : (readMeta(user.id).baseRevision ?? 0),
                        "recovery",
                      );
                    } catch (error) {
                      setStatus(
                        error instanceof Error
                          ? error.message
                          : "Recovery failed.",
                      );
                    }
                  }}
                >
                  Recover{" "}
                  {kind === "cloud-outbox" ? "pending save" : "sign-out copy"}
                </button>
              </div>
            ))}
          </details>
          <div className={styles.actions}>
            <button disabled={busy} onClick={() => void sync()}>
              Retry / sync now
            </button>
            <button
              onClick={() =>
                download(
                  collectWorkspace(localStorage),
                  "bindforge-account-workspace.json",
                )
              }
            >
              Export current workspace
            </button>
            <button onClick={() => void loadHistory()}>
              Review saved versions
            </button>
            <button disabled={busy} onClick={() => void signOut()}>
              Sign out & clear visible account data
            </button>
          </div>
          {history.length ? (
            <div className={styles.section}>
              <h2>Saved versions</h2>
              {history.map((row) => (
                <p key={row.revision}>
                  Revision {row.revision}{" "}
                  <button
                    onClick={() =>
                      download(row, `bindforge-revision-${row.revision}.json`)
                    }
                  >
                    Export
                  </button>
                </p>
              ))}
            </div>
          ) : null}
          <details className={styles.section}>
            <summary>Delete my account</summary>
            <p>
              This permanently deletes your cloud workspace and saved history. A
              local export is prepared first. Type DELETE MY ACCOUNT to enable
              deletion.
            </p>
            <label htmlFor="delete-account-confirm">
              Deletion confirmation
            </label>
            <input
              id="delete-account-confirm"
              autoComplete="off"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
            />
            <div className={styles.actions}>
              <button
                className={styles.danger}
                disabled={busy || deleteText !== "DELETE MY ACCOUNT"}
                onClick={() => void deleteAccount()}
              >
                Permanently delete my account
              </button>
            </div>
          </details>
        </>
      )}
      <p className={styles.muted}>
        Only versioned BindForge product documents are synced. Google
        credentials, authentication tokens and unrelated browser storage are
        excluded from workspace exports. Sign-out clears the visible account
        workspace; a recovery copy remains isolated by account on this browser.
      </p>
    </section>
  );
}
