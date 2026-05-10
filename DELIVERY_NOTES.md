# Delivery notes

This version adds a GitHub Actions DevSecOps CI/CD pipeline for the Next.js application.

## Main changes

- Added `.github/workflows/devsecops-ci-cd.yml` with build, lint, typecheck, unit tests, CodeQL SAST, Trivy SCA, Gitleaks secret detection, OWASP ZAP DAST, and delivery artifact jobs.
- Added `.github/dependabot.yml` for dependency and GitHub Actions update PRs.
- Removed the committed `.env` from the deliverable and added `.env.example` with placeholders.
- Added `/api/health` for CI/DAST readiness checks.
- Added security headers in `next.config.ts`.
- Fixed Next.js build blockers in `app/layout.tsx` and `app/messages/page.tsx`.
- Fixed a React hook lint issue in `components/SuggestionsTab.tsx`.
- Added Jest configuration and a password validation unit test.

## Local verification performed

- `npm run lint` completed with warnings only.
- `npm run typecheck` passed.
- `npm test` passed: 3 tests.
- `npm run build` passed with CI-safe placeholder environment variables.
