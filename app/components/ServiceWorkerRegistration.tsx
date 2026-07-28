"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    async function removeLegacyOfflineCache() {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }

      if ("caches" in window) {
        const cacheNames = await window.caches.keys();
        await Promise.all(cacheNames.filter((name) => name.startsWith("bindforge-nw-")).map((name) => window.caches.delete(name)));
      }
    }

    void removeLegacyOfflineCache().catch(() => {
      // Cache cleanup is best-effort and must never interrupt the app.
    });
  }, []);

  return null;
}
