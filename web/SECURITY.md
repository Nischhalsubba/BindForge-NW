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
