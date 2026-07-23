# Production deployment verification

Use this after the release candidate has passed both automated and manual verification.

## Deployment record

- Production URL:
- Provider/project:
- Deployment ID:
- Commit SHA:
- Deployment date:
- Verifier:

## Availability and routing

- [ ] Production URL loads over HTTPS
- [ ] Root route returns the application
- [ ] Unknown route returns the BindForge not-found experience
- [ ] Refreshing a nested or missing route does not produce a provider-level platform error
- [ ] No mixed-content or blocked-resource errors appear in the browser console

## Product smoke test

- [ ] Search bar is present and usable
- [ ] Action dropdown is present and usable
- [ ] Mobile filter disclosure works
- [ ] Preset cards render
- [ ] Bind output works
- [ ] Unbind output works
- [ ] Command Lab works
- [ ] Custom chat builder works
- [ ] Clipboard action works or exposes the manual-copy fallback
- [ ] Local settings survive reload
- [ ] Backup export and import work
- [ ] Clear saved data works

## Responsive production review

- [ ] 360px mobile viewport has no horizontal page overflow
- [ ] 390px mobile viewport has no clipped toolbar controls
- [ ] Tablet portrait layout is usable
- [ ] Tablet landscape layout is usable
- [ ] Desktop layout keeps the toolbar and filters accessible
- [ ] Search and action dropdown remain visible at every reviewed width

## Accessibility and metadata

- [ ] Keyboard-only navigation works
- [ ] Focus indicators are visible
- [ ] Dark and light appearance remain readable
- [ ] Page title and description are correct
- [ ] Open Graph image loads
- [ ] Favicon loads
- [ ] `robots.txt` loads
- [ ] `llms.txt` loads
- [ ] Canonical URL is configured
- [ ] Sitemap is configured when public indexing is intended

## Observability

- [ ] Browser console has no unexpected errors
- [ ] Deployment logs show no startup or runtime failures
- [ ] Platform health checks are green
- [ ] A rollback target is identified

## Evidence

- Desktop screenshot:
- Mobile screenshot:
- Workflow URL:
- Deployment logs URL:
- Known limitations:

## Final decision

- [ ] Production verified
- [ ] Roll back or fix forward
