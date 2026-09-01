"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

type GsapContext = { revert: () => void };
type GsapMatchMedia = {
  add: (query: string, callback: () => void | (() => void)) => void;
  revert: () => void;
};
type GsapApi = {
  context: (callback: () => void, scope?: Element | Document) => GsapContext;
  from: (targets: string | Element | Element[], vars: Record<string, unknown>) => unknown;
  fromTo: (targets: string | Element | Element[], fromVars: Record<string, unknown>, toVars: Record<string, unknown>) => unknown;
  matchMedia: () => GsapMatchMedia;
};

declare global {
  interface Window {
    gsap?: GsapApi;
  }
}

export function GsapMotionEnhancer() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const gsap = window.gsap;
    if (!ready || !gsap) return;

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        gsap.from(".filter-top-bar", { y: -14, autoAlpha: 0, duration: 0.42, ease: "power2.out", clearProps: "transform,opacity,visibility" });
        gsap.from("#filter-panel section", { x: -10, autoAlpha: 0, duration: 0.34, stagger: 0.045, ease: "power2.out", clearProps: "transform,opacity,visibility" });
        gsap.from(".bind-group", { y: 16, autoAlpha: 0, duration: 0.4, stagger: 0.055, ease: "power2.out", clearProps: "transform,opacity,visibility" });
      }, document);

      const root = document.querySelector(".app-shell");
      const observer = root ? new MutationObserver((records) => {
        const targets: Element[] = [];
        for (const record of records) {
          for (const node of record.addedNodes) {
            if (!(node instanceof Element)) continue;
            if (node.matches("[data-gsap-enter]")) targets.push(node);
            targets.push(...node.querySelectorAll("[data-gsap-enter]"));
          }
        }
        if (targets.length) {
          gsap.fromTo(targets, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.32, stagger: 0.025, ease: "power2.out", clearProps: "transform,opacity,visibility", overwrite: "auto" });
        }
      }) : null;
      observer?.observe(root!, { childList: true, subtree: true });

      const navClick = (event: Event) => {
        const target = event.target instanceof Element ? event.target.closest("[data-gsap-nav]") : null;
        if (!target) return;
        gsap.fromTo(target, { scale: 0.96 }, { scale: 1, duration: 0.28, ease: "back.out(2)", clearProps: "transform", overwrite: "auto" });
      };
      document.addEventListener("click", navClick);

      return () => {
        observer?.disconnect();
        document.removeEventListener("click", navClick);
        context.revert();
      };
    });

    return () => media.revert();
  }, [ready]);

  return (
    <Script
      id="bindforge-gsap"
      onLoad={() => setReady(true)}
      src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"
      strategy="afterInteractive"
    />
  );
}
