# BindForge cloud workspace setup

Dedicated Supabase project: BindForge NW (`duqodgqrbgrhmfneqhlr`, Singapore).
Dashboard: https://supabase.com/dashboard/project/duqodgqrbgrhmfneqhlr

## Deployment configuration
The dedicated project’s URL and public publishable key are configured in app/lib/cloud-config.ts. Optional NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variables override them. Netlify does not need private Google credentials. See web/.env.example. Never use the service-role key in the browser or commit private OAuth credentials.

Both migrations in web/supabase/migrations have been applied to the dedicated project. Owner-only SELECT policies protect workspace and history tables. All writes use revision checks and derive ownership from auth.uid(); the expected identity parameter must match the verified bearer identity. Keep both migration files in order.

## Google login — required before release
1. Create a Google OAuth Web application in the owner’s Google Cloud project and configure the consent screen.
2. Add this authorized redirect URI: https://duqodgqrbgrhmfneqhlr.supabase.co/auth/v1/callback
3. In Supabase Authentication → Sign In / Providers → Google, enter the client ID and secret and enable Google. Enter the secret directly in the dashboard.
4. Set the Supabase Site URL to the final app origin and allow its /account redirect. Add an exact staging /account URL for testing.
5. Verify login, logout, account switching, expired sessions and fresh-browser returning login. Email magic-link sign-in also requires valid redirect settings and delivery configuration.

Google provider credentials remain owner-configured. The frontend public project connection is configured in code; provider availability is checked live, and Google login is disabled with an explanation until enabled. A compiled button does not establish successful authentication.

## Behavior and release gate
Guest workflows work without Supabase. First login requires choosing local or cloud data before uploads. Settings, profile workspaces, library, builder, copy activity and keyboard layout are allowlisted; tokens and unrelated storage are excluded. Sync polls while the workbench is open. Cloud revisions retain the last 50 snapshots. Clean devices can pull newer revisions; divergent devices require review. Quarantined browser copies and pending saves have export/recovery controls.

Browser storage is not encrypted account storage. People sharing a browser profile can inspect its storage; use separate browser profiles for privacy. Recovery copies stay account-keyed locally until deletion. Account export currently covers product workspace and per-revision downloads, not a complete provider-data archive.

Release remains blocked on browser QA of route transitions, first-login migration, offline reload, pending-save recovery, two accounts/two tabs, restore quota failures and Google/email flows. The preview runner now launches Next.js. Guest copy, builder duplicate/undo/redo, named combination persistence and account-return navigation were manually verified; authenticated cross-device flows remain pending Google provider configuration. Screen-reader verification remains pending.

## Database evidence (2026-11-09)
Transaction-scoped tests on the actual project verified owner isolation, denied direct writes/anonymous RPC calls, stale-revision rejection, account deletion cascade and malformed envelope rejection; all test rows rolled back. A follow-up tested expected-identity save/delete rejection and preservation of another account.

The security advisor reports two intentional authenticated SECURITY DEFINER functions. Both use empty search_path, auth.uid(), expected-identity checks, revoked PUBLIC/anon execution and authenticated-only grants. This warning is acknowledged rather than reported as a clean advisor scan. Reference: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable

## Scope
This is the cloud foundation and local workflow slice. It does not finish the full approved roadmap. Private/public hosted sharing, moderation, guild roles, cached offline catalogue, AI assistance and administration remain future slices. The redesigned workbench is now the root route. The existing advanced toolset is retained at /advanced. Workbench state is included under the existing versioned builder cloud document; no extra database migration is needed.

## Exact production Google settings
- Google Auth Platform app name: BindForge NW; audience: External (start with test users, then publish when ready for public use).
- Basic scopes only: openid, email, profile.
- OAuth client type: Web application.
- Authorized JavaScript origin: https://neverwinterkeybind.netlify.app
- Authorized redirect URI: https://duqodgqrbgrhmfneqhlr.supabase.co/auth/v1/callback
- Supabase Google provider: paste the Google Client ID and Client Secret directly in the dashboard and enable it.
- Supabase Site URL: https://neverwinterkeybind.netlify.app
- Supabase additional redirect URL: https://neverwinterkeybind.netlify.app/account
- App homepage: https://neverwinterkeybind.netlify.app
- Privacy page: https://neverwinterkeybind.netlify.app/privacy
- After saving, reload /account. The Google button enables when the provider reports availability. Sign in, approve the guest/cloud review, edit a bind, and verify the cloud revision on a second device.

Official references: https://supabase.com/docs/guides/auth/social-sign-in/auth-google and https://supabase.com/docs/guides/auth/redirect-urls
