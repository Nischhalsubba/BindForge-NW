# Demo integration and Netlify release

User authorization: integrate everything from the reviewed demo into main, deploy to Netlify, finish code-side Google authentication, and supply owner configuration steps.

Implementation: retained demo becomes the root workbench using local bundled Bootstrap, GSAP/Flip and its token/style layers; existing React toolset is retained at /advanced. Public catalogue and engine files regenerate from repository sources before builds. Accounts use the same Supabase backend; new workbench state is nested in the existing builder cloud document, preserving the current RPC contract.

Validation: guest copy, duplicate/undo/redo, named combination save/reload, provider-disabled feedback and account-return navigation verified with the browser. Automated core checks pass 156 tests plus lint/typecheck/catalogue/client audit/build; browser suite typecheck passes. Root/account E2E tests added, historical tests now exercise /advanced.

One fresh integration review found recovery bases, concurrent pulls, repeated isolation, draft history size, guard exception handling and provider-error feedback defects. A single fix pass addressed these. Regression tests cover nested workspace roundtrip, repeat isolation and large-history serialization. Google OAuth cannot be tested until owner credentials are configured.

Ruling: preserve the advanced interface at /advanced rather than remove working capabilities — keeps profile/assignment/recovery workflows accessible; visual harmonisation of that retained interface remains a later refinement.
Ruling: public Supabase project URL/key are configured in code (environment overrides supported) — no private Google credential is shipped; database permissions enforce access.
Ruling: workbench state nests in the existing builder document — avoids another schema migration and keeps existing backend compatibility; old application versions must not be used to edit cloud workspaces concurrently.
Ruling: preserve the repository's explicit Netlify release gate — final marker commit changes .github/production-release.json and ends in [deploy]. User has explicitly authorized merge and deploy.

Google owner steps are in web/docs/CLOUD_SETUP.md. The full community/guild/AI/admin roadmap is not claimed delivered by this release.

Hosted checks for the integration passed desktop/tablet/mobile Chromium and Firefox/WebKit smoke, core, dependency audit and CodeQL. The repository’s automated review then identified false pending-queue conflicts and parameterized-preset reload confusion; both were verified and fixed with red→green unit regressions and a browser regression for parameterized reloads. Final local core suite: 158/158; browser typecheck passes. Final hosted checks run on the release head before merge.
