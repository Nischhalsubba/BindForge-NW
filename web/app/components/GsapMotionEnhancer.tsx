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
        gsap.from(".workbench-intro-aside", {
          x: -12,
          autoAlpha: 0,
          duration: 0.38,
          ease: "power2.out",
          clearProps: "transform,opacity,visibility",
        });
        gsap.from(".workbench-intro-main > *", {
          y: 12,
          autoAlpha: 0,
          duration: 0.42,
          stagger: 0.06,
          ease: "power2.out",
          clearProps: "transform,opacity,visibility",
        });
        gsap.from(".filter-top-bar", {
          y: -10,
          autoAlpha: 0,
          duration: 0.38,
          ease: "power2.out",
          clearProps: "transform,opacity,visibility",
        });
        gsap.from("#filter-panel section", {
          x: -8,
          autoAlpha: 0,
          duration: 0.3,
          stagger: 0.035,
          ease: "power2.out",
          clearProps: "transform,opacity,visibility",
        });
        const firstGroups = Array.from(document.querySelectorAll(".bind-group")).slice(0, 4);
        if (firstGroups.length) {
          gsap.from(firstGroups, {
            y: 12,
            autoAlpha: 0,
            duration: 0.36,
            stagger: 0.045,
            ease: "power2.out",
            clearProps: "transform,opacity,visibility",
          });
        }
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
              stagger: 0.02,
              ease: "power2.out",
              clearProps: "transform,opacity,visibility",
              overwrite: "auto",
            },
          );
        }
      }) : null;
      observer?.observe(root!, { childList: true, subtree: true });

      const navClick = (event: Event) => {
        const target = event.target instanceof Element ? event.target.closest("[data-gsap-nav]") : null;
        if (!target) return;
        gsap.fromTo(
          target,
          { scale: 0.97 },
          { scale: 1, duration: 0.22, ease: "back.out(2)", clearProps: "transform", overwrite: "auto" },
        );
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
