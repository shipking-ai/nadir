# SignPath Foundation application — ready to paste

Free code signing for Windows is only available to open-source projects through **SignPath Foundation**. This page has an answer for every field on the form at <https://signpath.org/apply> (checked 2026-10-13), the requirements it checks against, and an honest note on the odds.

**You must submit the form yourself:** it contains a reCAPTCHA and consent checkboxes that only a person may complete, and the SignPath account is created in your name.

## Before you apply — requirements from <https://signpath.org/terms> (read 2026-10-13) and where Pelorus stands
| Requirement | Status |
|---|---|
| OSI-approved licence, no commercial dual-licensing | ✔ GPL-3.0-or-later ([LICENSE](../LICENSE)) |
| No proprietary components (system libraries excepted) | ✔ Electron/Chromium/Ghostery adblocker are open source; see [LICENSE-INVENTORY.md](LICENSE-INVENTORY.md) |
| Project already released in the form to be signed | ✔ v0.3.0 installer and zip |
| Functionality described on the download page | ✔ README "Download" section |
| Code signing policy on the home page, using the term "Code signing policy", with roles and privacy policy | ✔ README section + [CODE-SIGNING-POLICY.md](CODE-SIGNING-POLICY.md) + [PRIVACY.md](PRIVACY.md). The exact sentence "Free code signing provided by SignPath.io, certificate by SignPath Foundation" is **not** added yet because it would be untrue; it goes in right after approval (see below) |
| Multi-factor authentication for all team members on SignPath and GitHub | ✔ GitHub (you confirmed step 1); enable it on SignPath when you create the account |
| Roles: authors, reviewers, approvers | ✔ listed (one person holds all three; stated openly) |
| Every release manually approved for signing; built in a verifiable way from the repository | ✔ GitHub Actions build with provenance attestations; approval is done in SignPath after approval of the project |
| File metadata (product name = project name, same product version in each build) | ✔ `ProductName=Pelorus`, `ProductVersion` equals the package version, set by the packager |
| No hacking tools; privacy-respecting; uninstaller provided | ✔ browser; no telemetry; the installer registers an uninstaller |
| Maintained, with verifiable **reputation** (for executables) | ⚠ **weak point, see below** |

## Answers for the form fields
| Field | Paste this |
|---|---|
| Project Name* | `Pelorus` |
| Repository URL* | `https://github.com/shipking-ai/pelorus` |
| Homepage URL* | `https://github.com/shipking-ai/pelorus` |
| Download URL | `https://github.com/shipking-ai/pelorus/releases` |
| Privacy Policy URL | `https://github.com/shipking-ai/pelorus/blob/main/docs/PRIVACY.md` |
| Wikipedia URL | leave empty |
| Tagline* | `An open-source, privacy-focused desktop browser with isolated workspaces.` |
| Category* | pick the closest to "Web browser" / "Internet" in the dropdown |
| Description* | `Pelorus is a desktop web browser built on Chromium through Electron. It keeps browsing in isolated workspaces with separate cookies and storage, blocks ads and trackers by default, upgrades connections to HTTPS and offers no bypass for certificate errors, and keeps all of its data on the user's computer. It has no telemetry and no accounts. GPL-3.0-or-later.` |
| Reputation* | see the honest text below |
| Maintainer Type | individual / independent maintainer (pick the closest) |
| Build System* | GitHub Actions |
| First name / Last name* | yours (the SignPath account is created under this name) |
| Email* | yours |
| Company Name | leave empty unless you apply as an organisation |
| Primary Discovery Channel* | whichever is true |
| Checkboxes | read the Code of Conduct (linked on the form) and tick the required ones yourself |

### Honest text for "Reputation"
> Pelorus is a new project: the repository was created and made public on 2026-10-13 and the first release was published the same day (the project was developed privately before that), so it has no media coverage and no meaningful download or star statistics yet. What exists today and can be verified: public source with a CI pipeline (unit, end-to-end, accessibility and TLS tests on Windows, Ubuntu and macOS), releases built only by GitHub Actions from tags with build-provenance attestations, checksums and an SBOM, a published security policy with private vulnerability reporting, a privacy policy, a code signing policy, and a classified catalogue of 770+ related open-source projects showing the project's research basis. I understand if SignPath prefers to wait until the project has a track record, and I am happy to reapply later.

(Do not inflate this. SignPath says it verifies reputation and a false statement would end the application and could end the project's eligibility.)

## One question to put in the application
Pelorus.exe is the Electron runtime executable, renamed and re-branded (its resources and metadata are changed), so it is *derived from an upstream binary*. SignPath's terms say upstream binaries must not be signed under a project's subscription, while "modified versions" can be signed only under conditions (upstream signed builds, a visible fork, and so on). **Ask them explicitly** (there is no free-text field for it, so email support@signpath.io or add it to a follow-up): "May we sign `Pelorus.exe` (re-branded Electron) and the Squirrel installer, or only the installer and our own files?" Their answer decides what the release workflow signs.

## What I will do the moment you are approved (tell me the organisation ID and project slug; never the token)
1. In **SignPath**: create the artifact configuration (a zip containing `Pelorus.exe` and the installer), a signing policy with **manual approval**, and file-metadata restrictions (`ProductName` = Pelorus; the same `ProductVersion` in every build). Their documentation covers these steps; I will write the exact values.
2. Add the API token as a repository secret (you do this; Settings → Secrets and variables → Actions).
3. I change `.github/workflows/release.yml` to upload the unsigned artifacts, call SignPath's official GitHub Action, wait for **your manual approval in SignPath**, download the signed files, then attest and publish.
4. I change README and CODE-SIGNING-POLICY.md to the required sentence: "Free code signing provided by SignPath.io, certificate by SignPath Foundation".
5. Tag the next release; verify on a clean Windows machine (`Get-AuthenticodeSignature`).

## Odds, honestly
SignPath says it needs "a certain verifiable reputation" before it signs an executable people will download, and that it cannot sign "source code that nobody knows". Pelorus is days old, so **rejection or a request to come back later is likely.** Applying costs nothing. If they decline:
1. **Build a real track record, then reapply** (weeks to months): keep releasing, answer issues, get real users, a write-up on a blog or forum by someone who used it. Nothing artificial: no bought stars, no fake reviews.
2. **Paid fallback, usually cheap:** Microsoft's Azure signing service (search "Artifact Signing", formerly Trusted Signing; check its current price and whether your country and account type are eligible) or a commercial certificate with cloud signing. [OWNER-STEPS.md](OWNER-STEPS.md) Step 3 paths B and C.
3. **Do nothing:** unsigned builds still work; users get a SmartScreen warning and can verify with the checksum and provenance attestation.
