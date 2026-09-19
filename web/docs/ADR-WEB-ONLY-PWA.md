# ADR: Web-only delivery instead of an offline PWA

**Status:** Accepted  
**Decision date:** 2026-09-19  
**Decision: intentionally web-only**

## Context

BindForge contains command syntax, evidence, verification dates, and patch-sensitive Neverwinter guidance. An offline service worker can leave a player using a stale command catalogue after the live game changes.

## Decision

BindForge will remain an intentionally web-only application for the current product generation.

- There is **no service worker** and no offline application cache.
- The existing web manifest may continue to provide browser metadata, but it is not a promise of offline operation.
- Catalogue freshness, verification history, stale warnings, and source evidence take priority over installability.
- A future PWA proposal must define cache invalidation, visible catalogue-version freshness, forced update behavior, and a safe degraded/offline state before a service worker can return.

## Consequences

Players need a network connection to load BindForge. In return, the product avoids silently presenting an old cached catalogue as current. The existing release regression that expects `/sw.js` to return 404 is intentional and must remain.
