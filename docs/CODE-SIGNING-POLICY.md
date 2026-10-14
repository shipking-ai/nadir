# Code signing policy

**Status (2026-10-13): Pelorus releases are NOT code-signed.** No signing certificate exists yet, and no signing service has agreed to sign Pelorus. This page states the policy that will apply when one does, so that users and any certificate provider can see the rules in advance. If this page and a release's notes disagree, the release notes say what that specific build is.

## What gets signed, and from where
- Only `Pelorus.exe` (and a future installer) built by the **public GitHub Actions workflow** [`release.yml`](../.github/workflows/release.yml) from a **tagged commit of the public repository** <https://github.com/shipking-ai/pelorus>.
- Never a build made on a developer machine, never a build from an untagged or unreviewed branch, never a binary supplied from outside the repository.
- Electron's other binaries keep their upstream signatures and are not re-signed.
- The signing step in `release.yml` uses a certificate held as a repository secret (or, if a signing service is adopted, the service's own origin-verification flow). It has **never been run with a real certificate**; see [RELEASE.md](RELEASE.md).

## Verifying a build
Every release publishes `SHA256SUMS.txt`, a CycloneDX SBOM, and a GitHub **build-provenance attestation**. To check that a zip came from this repository's workflow:

```
gh attestation verify Pelorus-<version>-win32-x64.zip --repo shipking-ai/pelorus
```

This works for unsigned releases too, and is the recommended check until a signing certificate exists.

## Roles
Pelorus currently has **one maintainer** (GitHub account `shipking-ai`), who holds every role below. This is a weakness, not a feature; the roles are listed so that they can be split as contributors join.

| Role | Responsibility | Held by |
|---|---|---|
| Authors (committers) | trusted to modify the source without extra review | [shipking-ai](https://github.com/shipking-ai) |
| Reviewers | review every change proposed by someone who is not an author (pull requests) | [shipking-ai](https://github.com/shipking-ai) (no independent reviewer yet) |
| Approvers | create the release tag and approve each signing request manually | [shipking-ai](https://github.com/shipking-ai) |

Rules that apply regardless of who holds the roles:
- A release tag is created only after the CI workflow ([`ci.yml`](../.github/workflows/ci.yml)) is green on that commit.
- Signing keys are never committed, never printed in logs, and never used from a personal machine for releases.
- A compromised or misused certificate is reported publicly in a GitHub security advisory and revoked with the issuer.
- Third-party code is limited to dependencies listed in the SBOM; `scripts/license-inventory.js` fails the build on unknown production licences.

## Privacy policy for the program
The stand-alone policy is [PRIVACY.md](PRIVACY.md); this section is the short form.

Pelorus does **not** send telemetry, crash reports, usage statistics or identifiers to the maintainers or anyone else. The only network requests Pelorus makes by itself are:
- downloading ad/tracker filter lists from Ghostery's CDN (no user identifiers; switch blocking off to stop it);
- DNS-over-HTTPS lookups to the resolver the user configures, if the user turns that on;
- **only when the user presses "Check for updates" on the About page:** one request to `api.github.com` for the project's public release list (no cookies, no identifiers beyond the IP address and a fixed `Pelorus-update-check` user agent). Pelorus never checks in the background and never downloads or installs an update by itself;
- requests the user asks for by browsing (including favicons for pages they visit and search-engine pages they choose).

Pelorus stores history, bookmarks and settings locally on the user's computer; it does not upload them. Details and the known gaps are in [SECURITY.md](SECURITY.md).

## Reporting a problem with a signed or unsigned build
Use private vulnerability reporting as described in [SECURITY.md](SECURITY.md). If you believe a published binary does not match this repository, say so there and include the output of the attestation check above.

## Acknowledgements (to be added when true)
If a third-party signing service or foundation signs Pelorus, its required attribution will be added here **only after** it has actually done so.
