# Production verification findings — 2026-07-23

## Confirmed deployment

- Provider: Cloudflare Workers
- Production URL: https://bindforge-nw.hinischalsubba.workers.dev/
- Production branch: `main`
- Automatic deployment on merge: confirmed
- Cloudflare Worker: `bindforge-nw`
- Cloudflare Version ID: `994ca761-397a-4004-a03c-c048078e9a5f`
- Build result: successful
- Deploy result: successful

## Build observations

- Next.js compiled successfully.
- TypeScript completed successfully.
- OpenNext generated the Worker bundle successfully.
- Static assets uploaded successfully.
- Worker startup time reported as 30 ms.
- Cloudflare reported nine dependency vulnerabilities: one low, one moderate, and seven high.
- Next.js warned that `metadataBase` was missing and used `http://localhost:3000` for social-image resolution.

## Remaining blockers from GitHub Quality run 75

- Tablet toolbar actions are obstructed by overlapping sticky elements.
- Theme controls can sit outside the usable viewport or be covered by adjacent sidebar content.
- Persistence verification reloads before the newest autosave is durably written.
- Dark-theme accent controls fail the axe color-contrast baseline.
- The production URL still needs an external interactive smoke test after these fixes deploy.
