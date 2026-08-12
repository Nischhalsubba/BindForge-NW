# Phase 7 and 8 release hardening

## PWA decision

BindForge NW does not currently promise offline support or installability.

The previous service worker cached the application shell but was later unregistered on every production visit. That contradictory state could preserve stale layouts without providing reliable offline behavior. Phase 7 removes the service worker, cleanup component, manifest metadata reference, and offline claims.

A future PWA implementation must be a separate project with versioned caches, network-first navigation, update messaging, expiry rules, and old-to-new deployment tests.

## Accessibility and usability baseline

The release gate covers:

- unique accessible names for primary controls;
- keyboard navigation and visible focus;
- dialog opening, Escape dismissal, and focus restoration;
- dark and light theme axe scans;
- open filter/settings surfaces;
- minimum 44 px touch targets on narrow and coarse-pointer layouts;
- reduced-motion behavior;
- no page-level horizontal overflow;
- no active service-worker registration.

## Manual release verification

Record the following before promoting a release:

- commit SHA and pull request;
- GitHub Quality workflow URL and result;
- Production smoke workflow URL and result;
- Netlify deploy-preview URL;
- production deployment URL;
- tester, date, browser versions, and viewport/device list;
- Cards and Compact layouts;
- search, class, difficulty, action, source, and safety filters;
- mobile filter drawer and Settings dialog;
- card Details, copy, selection, collections, packs, backup import/export, and clear-data confirmation;
- dark/light themes and reduced motion;
- no console errors, stale service worker, or horizontal overflow;
- accepted limitations.

A release is blocked until automated checks are green and the preview is visually reviewed. A successful build is evidence that files exist, not that the interface has retained its dignity.
