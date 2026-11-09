import { getCloudClient } from "./supabase-client";
import {
  collectWorkspace,
  workspaceFingerprint,
  planSync,
  queueLatestDraft,
  restoreWorkspace,
  isolateAccountWorkspace,
} from "./cloud-workspace.mjs";
const ownerKey = "bindforge-nw:cloud-owner";
export async function verifyWorkspaceOwner() {
  const owner = localStorage.getItem(ownerKey);
  if (!owner) return;
  const client = getCloudClient();
  if (!client) throw Error("Cloud connection unavailable.");
  const cached = await client.auth.getSession();
  if (localStorage.getItem(ownerKey) !== owner) {
    location.reload();
    throw Error("Account changed.");
  }
  if (cached.data.session?.user.id !== owner) {
    isolateAccountWorkspace(localStorage, owner);
    location.reload();
    throw Error("Account changed.");
  }
  if (!navigator.onLine) return;
  const verified = await client.auth.getUser();
  if (localStorage.getItem(ownerKey) !== owner) {
    location.reload();
    throw Error("Account changed.");
  }
  if (verified.error)
    throw Error(
      "Could not verify this account. Check your connection and reload.",
    );
  if (verified.data.user?.id !== owner) {
    isolateAccountWorkspace(localStorage, owner);
    location.reload();
    throw Error("Account changed.");
  }
}
export function startCloudSync(status: (message: string) => void) {
  const client = getCloudClient(),
    owner = localStorage.getItem(ownerKey);
  if (!client || !owner) return;
  let busy = false,
    paused = false,
    debounce: ReturnType<typeof setTimeout>;
  const metaKey = `bindforge-nw:cloud-meta:${owner}`,
    queueKey = `bindforge-nw:cloud-outbox:${owner}`;
  async function sync() {
    if (busy || paused) return;
    busy = true;
    try {
      if (localStorage.getItem(ownerKey) !== owner) {
        location.reload();
        return;
      }
      const meta = JSON.parse(localStorage.getItem(metaKey) || "null");
      if (!meta?.approved) {
        status("Review account data to enable cloud saving");
        return;
      }
      const local = collectWorkspace(localStorage),
        fingerprint = workspaceFingerprint(local),
        queued = queueLatestDraft(
          owner!,
          local,
          meta.baseRevision ?? 0,
          JSON.parse(localStorage.getItem(queueKey) || "null"),
        );
      if (!navigator.onLine) {
        localStorage.setItem(queueKey, JSON.stringify(queued));
        status("Offline — edits queued");
        return;
      }
      const { data, error } = await client!
        .from("bindforge_workspaces")
        .select("revision,document")
        .eq("user_id", owner)
        .maybeSingle();
      if (localStorage.getItem(ownerKey) !== owner || paused) return;
      if (error) throw error;
      const plan = planSync({
        local,
        remote: data,
        baseRevision: queued.baseRevision,
        baseFingerprint: meta.baseFingerprint,
        migrationApproved: true,
      });
      if (plan.action === "download" && data) {
        if (
          workspaceFingerprint(collectWorkspace(localStorage)) !== fingerprint
        )
          return;
        restoreWorkspace(localStorage, data.document);
        localStorage.setItem(
          metaKey,
          JSON.stringify({
            approved: true,
            baseRevision: data.revision,
            baseFingerprint: workspaceFingerprint(data.document),
          }),
        );
        location.reload();
        return;
      }
      if (plan.action === "current") {
        localStorage.setItem(
          metaKey,
          JSON.stringify({
            approved: true,
            baseRevision: plan.revision,
            baseFingerprint: fingerprint,
          }),
        );
        localStorage.removeItem(queueKey);
        status("Cloud saved");
        return;
      }
      if (plan.action !== "upload") {
        paused = true;
        status("Cloud difference — review both copies in Account");
        return;
      }
      localStorage.setItem(queueKey, JSON.stringify(queued));
      const result = await client!.rpc("bindforge_save_workspace", {
        expected_user_id: owner,
        expected_revision: queued.baseRevision,
        workspace_document: local,
      });
      if (localStorage.getItem(ownerKey) !== owner || paused) return;
      if (result.error) throw result.error;
      localStorage.setItem(
        metaKey,
        JSON.stringify({
          approved: true,
          baseRevision: Number(result.data),
          baseFingerprint: fingerprint,
        }),
      );
      const latest = collectWorkspace(localStorage);
      if (workspaceFingerprint(latest) === fingerprint)
        localStorage.removeItem(queueKey);
      else
        localStorage.setItem(
          queueKey,
          JSON.stringify(queueLatestDraft(owner!, latest, Number(result.data))),
        );
      status("Cloud saved");
    } catch {
      status("Save delayed — local edits retained; open Account to retry");
    } finally {
      busy = false;
    }
  }
  const changed = () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => void sync(), 900);
  };
  window.addEventListener("bindforge:workspace-change", changed);
  window.addEventListener("online", changed);
  window.addEventListener("storage", (event) => {
    if (event.key === ownerKey) {
      location.reload();
      return;
    }
    if (
      event.key?.startsWith("bindforge-nw:") &&
      !event.key.includes("cloud-outbox")
    ) {
      paused = true;
      status("Another tab changed this workspace — reload to continue");
    }
  });
  client.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT" || session?.user.id !== owner) {
      paused = true;
      setTimeout(() => {
        isolateAccountWorkspace(localStorage, owner);
        location.reload();
      }, 0);
    }
  });
  setInterval(() => void sync(), 30000);
  void sync();
}
