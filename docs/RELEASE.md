# Releasing Pelorus (Windows) — what exists and what is missing

## What exists and was tested
- `npm run package` builds `out/Pelorus-win32-x64/` with `@electron/packager`. `node scripts/verify-package.js` launches that build like a user would and checks it starts, shows its UI, browses a local page and has its hardening applied. Last run: **PACKAGED APP OK** (2026-10-12).
- The GPL-3.0 text ships as `resources/LICENSE`; Electron's own `LICENSE` and `LICENSES.chromium.html` sit next to `Pelorus.exe`.
- `scripts/sign.ps1` (`npm run sign`, `npm run package:signed`) signs `Pelorus.exe` with Authenticode (SHA-256) and verifies it. **Tested only with a throwaway self-signed certificate on a copy of the exe**: the signature was embedded and read back (status `UnknownError` = untrusted root, as expected), the certificate was removed from the store afterwards, and the real build was left untouched. It has **not** been run with a real certificate or a timestamp server.

## What is missing (cannot be done from inside the repository)
1. **A code-signing certificate.** Without one, Windows SmartScreen shows "unknown publisher" warnings on download. Options, none verified by me against current pricing or terms:
   - **SignPath Foundation** offers certificates to open-source projects. Per its published terms (checked 2026-10-12): OSI-approved licence with no commercial dual-licensing, no proprietary components, project already released and actively maintained, public repository, free downloads, a published code-signing policy on the project home page, and a fully automated build with origin verification. The Foundation, not the project, is the named publisher. Pelorus is GPL-3.0 and has no proprietary components of its own, and now has a public repository, a tagged pre-release, a published code-signing policy and a GitHub Actions build with a provenance attestation. **Not yet confirmed:** whether SignPath accepts that setup (its origin verification has its own requirements), and whether a project this new counts as "actively maintained"; read their current terms before applying.
   - An **OV/EV certificate** from a commercial CA, or **Azure Trusted Signing** (availability and eligibility vary by region and organisation type; check Microsoft's current terms).
2. ~~A release process~~ **Done 2026-10-13:** public repository <https://github.com/shipking-ai/pelorus>; CI ([`ci.yml`](../.github/workflows/ci.yml)) runs unit tests, production audit, licence gate, all e2e tests, packaging, the packaged-app smoke test and an SBOM on every push; the tag-triggered [`release.yml`](../.github/workflows/release.yml) built and published **v0.1.0** (a pre-release, unsigned) with `SHA256SUMS.txt`, an SBOM and a build-provenance attestation; [CODE-SIGNING-POLICY.md](CODE-SIGNING-POLICY.md) is published. Verified after the fact: the downloaded zip matches its checksum, and `gh attestation verify` confirms it was built from `shipking-ai/pelorus` by `release.yml` at `refs/tags/v0.1.0`, commit `10146ac`.
3. ~~An installer~~ **Done:** `npm run installer` builds a per-user Squirrel.Windows setup (`out/installer/Pelorus-Setup-<version>.exe`, no administrator rights). Verified locally on Windows: silent install, first launch of the installed app, shortcut and uninstall-entry creation, silent uninstall (3 leftover files under `%LOCALAPPDATA%Pelorus` had to be removed by hand: a Squirrel behaviour). The release workflow builds it, signs it when a certificate exists, attests it and attaches it. **Auto-update is deliberately not built:** an automatic installer for an unsigned browser is a way to push unsigned code to users. The About page has a user-initiated "Check for updates" instead. Revisit after signing exists, with signature verification of update payloads (TLS alone is not enough).

## Release history

**Rename note (2026-10-13):** v0.1.0 and v0.2.0 were published under the former name **Nadir**: their files are named `Nadir-*`, they use the `nadir://` scheme and `NADIR_*` variables, and their build-provenance attestations name the old repository path. The repository is now `shipking-ai/pelorus`; verify those two old releases with `gh attestation verify <file> --repo shipking-ai/nadir` (or `--owner shipking-ai`). `--repo shipking-ai/pelorus` fails for them (tested). Releases built after the rename verify with the new name. Profiles created by Nadir builds (`%APPDATA%Nadir`) are **not** migrated to Pelorus.
| Version | Date | Notes |
|---|---|---|
| [v0.1.0](https://github.com/shipking-ai/pelorus/releases/tag/v0.1.0) | 2026-10-13 | first pre-release, zip only (391 MB), unsigned |
| [v0.2.0](https://github.com/shipking-ai/pelorus/releases/tag/v0.2.0) | 2026-10-13 | zip (147 MB, 7-Zip) and per-user installer (147 MB), unsigned. Both verified after publication: SHA-256 matches, and `gh attestation verify` confirms they were built from this repository by `release.yml` at tag `v0.2.0` (commit `429a4a6`). The CI-built installer was then downloaded and run on Windows: silent install, first launch, shortcut and uninstall entry, silent uninstall (4 leftover files removed by hand). Not tested: a clean VM, an upgrade from 0.1.0 (0.1.0 had no installer), SmartScreen behaviour. |
| [v0.3.0](https://github.com/shipking-ai/pelorus/releases/tag/v0.3.0) | 2026-10-13 | first release under the name **Pelorus**: zip and per-user installer (147 MB each), unsigned. Verified after publication: SHA-256 matches and `gh attestation verify <file> --repo shipking-ai/pelorus` succeeds for both files (built by `release.yml` at tag `v0.3.0`, commit `cf2ae44`). The CI-built installer was downloaded and run on Windows: silent install, first launch, Start Menu shortcut (folder now "Pelorus") and uninstall entry, silent uninstall (4 leftover files removed by hand). Not tested: a clean VM, SmartScreen, upgrade from an older install. Profiles from Nadir builds are not migrated. |

## Using `scripts/sign.ps1`
Set one of these environment variables (never put a password on a command line or in the repository):

| Variable | Meaning |
|---|---|
| `PELORUS_SIGN_PFX` + `PELORUS_SIGN_PFX_PASSWORD` | path to a `.pfx` and its password |
| `PELORUS_SIGN_THUMBPRINT` | thumbprint of a certificate in the current user's or the machine's `My` store (hardware tokens usually appear this way) |
| `PELORUS_TIMESTAMP_URL` | optional RFC 3161 timestamp server; without it the signature stops validating when the certificate expires. Contacting it sends a hash of the signature to that server. |

Exit codes: `0` signed and valid, `1` error, `2` no certificate configured (nothing signed), `3` signed but Windows does not trust/validate it. `-VerifyOnly` just reports the current signature.

Only `Pelorus.exe` is signed: Electron's other binaries keep their upstream signatures (the packaged `Pelorus.exe` itself was unsigned in the output, because renaming and re-branding it invalidates Electron's signature).

## Before a public release (checklist)
- [ ] certificate obtained and `npm run package:signed` returns exit code 0 on a clean machine
- [ ] public repository, security contact, code-signing policy page
- [ ] `node scripts/license-inventory.js` clean; Electron licence files present in the package (verified for 0.1.0)
- [ ] `npm audit` clean (0 vulnerabilities on 2026-10-12)
- [ ] unit + e2e + packaged smoke test green
- [ ] trademark decision after [TRADEMARK.md](TRADEMARK.md) (the name is not clear in software-adjacent classes)
- [ ] decide update channel and its integrity story
