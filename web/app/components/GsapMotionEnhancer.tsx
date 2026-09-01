"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

type GsapContext = { revert: () => void };
type GsapMatchMedia = {
  add: (query: string, callback: () => void | (() => void)) => void;
  revert: () => void;
};
type GsapTimeline = {
  from: (targets: string | Element | Element[], vars: Record<string, unknown>, position?: string) => GsapTimeline;
};
type GsapApi = {
  context: (callback: () => void, scope?: Element | Document) => GsapContext;
  from: (targets: string | Element | Element[], vars: Record<string, unknown>) => unknown;
  fromTo: (targets: string | Element | Element[], fromVars: Record<string, unknown>, toVars: Record<string, unknown>) => unknown;
  matchMedia: () => GsapMatchMedia;
  timeline: (vars?: Record<string, unknown>) => GsapTimeline;
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
        const entrance = gsap.timeline({ defaults: { ease: "power2.out" } });
        entrance
          .from(".workspace > aside, .workspace > .library", {
            y: 10,
            autoAlpha: 0,
            duration: 0.36,
            stagger: 0.055,
            clearProps: "transform,opacity,visibility",
          })
          .from(".filter-top-bar", {
            y: -8,
            autoAlpha: 0,
            duration: 0.3,
            clearProps: "transform,opacity,visibility",
          }, "<0.08")
          .from("[data-testid='secondary-controls'], #collections", {
            y: 8,
            autoAlpha: 0,
            duration: 0.3,
            stagger: 0.04,
            clearProps: "transform,opacity,visibility",
          }, "<0.05")
          .from(".bind-group:first-of-type .bind-card", {
            y: 10,
            autoAlpha: 0,
            duration: 0.3,
            stagger: 0.035,
            clearProps: "transform,opacity,visibility",
          }, "<0.05");
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
          gsap.fromTo(
            targets,
            { y: 8, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.28,
              stagger: 0.025,
              ease: "power2.out",
              clearProps: "transform,opacity,visibility",
              overwrite: "auto",
            },
          );
        }
      }) : null;
      observer?.observe(root!, { childList: true, subtree: true });

      const interactionPulse = (event: Event) => {
        if (!(event.target instanceof Element)) return;
        const target = event.target.closest("[data-gsap-nav], .filter-top-mode button");
        if (!target) return;
        gsap.fromTo(
          target,
          { scale: 0.985 },
          {
            scale: 1,
            duration: 0.2,
            ease: "power2.out",
            clearProps: "transform",
            overwrite: "auto",
          },
        );
      };
      document.addEventListener("click", interactionPulse);

      return () => {
        observer?.disconnect();
        document.removeEventListener("click", interactionPulse);
        context.revert();
      };
    });

    return () => media.revert();
  }, [ready]);

  return (
    <Script
      id="bindforge-gsap"
      onReady={() => setReady(true)}
      src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"
      strategy="afterInteractive"
    />
  );
}
