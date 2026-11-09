/* eslint-disable @next/next/no-css-tags -- Retained workbench styles load only on workbench/account documents. */
"use client";
import { useEffect } from "react";
import { workbenchMarkup } from "./workbench-markup";
function loadScript(src: string, module = false) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.type = module ? "module" : "text/javascript";
    script.onload = () => resolve();
    script.onerror = () => reject(Error("Workbench script failed to load"));
    document.body.append(script);
  });
}
export function DemoWorkbench() {
  useEffect(() => {
    let alive = true;
    void (async () => {
      try { await loadScript("/workbench/vendor/gsap.min.js");
      await loadScript("/workbench/vendor/Flip.min.js"); } catch { /* Copy/build tools remain available without motion libraries. */ }
      if (alive) await loadScript("/workbench/app.js", true);
    })().catch(() => {
      const state = document.getElementById("loadState");
      if (state)
        state.textContent =
          "The workbench could not start. Reload or open Advanced tools to continue.";
    });
    return () => {
      alive = false;
    };
  }, []);
  return (
    <>
      <link rel="stylesheet" href="/workbench/vendor/bootstrap.min.css" />
      <link rel="stylesheet" href="/workbench/tokens.css" />
      <link rel="stylesheet" href="/workbench/style.css" />
      <link rel="stylesheet" href="/workbench/components.css" />
      <div
        className="workbench-root"
        dangerouslySetInnerHTML={{ __html: workbenchMarkup }}
      />
      <noscript>
        Enable JavaScript to search and generate binds. Your saved data remains
        on this browser.
      </noscript>
    </>
  );
}
