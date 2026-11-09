"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCloudClient } from "../lib/supabase-client";
import { isolateAccountWorkspace } from "../lib/cloud-workspace.mjs";
export function CloudWorkspaceGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const isPublicDocument = usePathname() === "/privacy";
  const [ready, setReady] = useState(false),
    [message, setMessage] = useState("Opening your workbench…");
  useEffect(() => {
    if (isPublicDocument) return;
    let active = true,
      ownerWasPresent = false;
    const client = getCloudClient();
    async function check() {
      const owner = localStorage.getItem("bindforge-nw:cloud-owner");
      ownerWasPresent = !!owner;
      if (!owner) {
        if (active) setReady(true);
        return;
      }
      if (!client) {
        if (active)
          setMessage(
            "Account configuration is unavailable. Reload after restoring the connection.",
          );
        return;
      }
      const cached = await client.auth.getSession();
      if (!active) return;
      if (cached.data.session?.user.id !== owner) {
        isolateAccountWorkspace(localStorage, owner);
        location.reload();
        return;
      }
      if (!navigator.onLine) {
        setReady(true);
        return;
      }
      const verified = await client.auth.getUser();
      if (!active) return;
      if (verified.error) {
        setMessage(
          "Could not verify this account. Retry your connection, or open the workbench offline on this browser.",
        );
        return;
      }
      if (verified.data.user?.id !== owner) {
        isolateAccountWorkspace(localStorage, owner);
        location.reload();
        return;
      }
      setReady(true);
    }
    const start = setTimeout(
      () =>
        void check().catch(() => {
          if (active) {
            if (ownerWasPresent)
              setMessage(
                "Account verification failed. Your workspace remains locked; reload to retry.",
              );
            else setReady(true);
          }
        }),
      0,
    );
    const subscription = client?.auth.onAuthStateChange((event, session) => {
      const owner = localStorage.getItem("bindforge-nw:cloud-owner");
      if (owner && (event === "SIGNED_OUT" || session?.user.id !== owner)) {
        setReady(false);
        setTimeout(() => {
          if (active) {
            isolateAccountWorkspace(localStorage, owner);
            location.reload();
          }
        }, 0);
      }
    });
    const changed = (event: StorageEvent) => {
      if (event.key === "bindforge-nw:cloud-owner") {
        setReady(false);
        location.reload();
      }
    };
    window.addEventListener("storage", changed);
    return () => {
      active = false;
      clearTimeout(start);
      subscription?.data.subscription.unsubscribe();
      window.removeEventListener("storage", changed);
    };
  }, [isPublicDocument]);
  return ready || isPublicDocument ? (
    children
  ) : (
    <main style={{ padding: 32, fontSize: 18 }}>
      <p role="status">{message}</p>
      <button type="button" onClick={() => location.reload()}>
        Retry
      </button>
    </main>
  );
}
