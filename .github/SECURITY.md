# Security policy

## Supported version

Security fixes are applied to the current `main` branch and the production deployment at `https://neverwinterkeybind.netlify.app`.

## Reporting a vulnerability

Do not publish exploitable details in a public issue. Use GitHub private vulnerability reporting when available, or contact the repository owner through the private contact method listed on the GitHub profile.

Include:

- affected URL, file, or workflow
- reproduction steps
- expected and actual behavior
- security impact
- screenshots or logs with secrets removed

Reports should receive an acknowledgement within seven days. A fix timeline depends on severity and reproducibility.

## Scope

Relevant reports include dependency vulnerabilities, unsafe command generation, data import weaknesses, cross-site scripting, broken access assumptions, deployment misconfiguration, leaked secrets, and supply-chain risks.

The app stores preferences locally in the browser and does not operate a user-account backend. Never include personal data, API keys, game credentials, or session tokens in reports.

## Repository security baseline

Maintained changes are expected to pass lockfile-backed dependency installation, a full dependency audit at low severity or above, CodeQL analysis, focused-test guards, linting, type checks, catalog health checks, production builds, and the mobile/tablet/desktop browser regression matrix.

GitHub Actions are pinned to immutable commit SHAs in maintained workflows. Runtime-sensitive workflows use the repository-pinned Node.js version from `.node-version`. Cloudflare credentials, deployment tokens, and other runtime secrets must remain outside source control.

Passing automated checks reduces known risk but does not prove that software is risk-free. New findings are treated as defects and remediated through the normal branch, pull-request, validation, and controlled-release process.
