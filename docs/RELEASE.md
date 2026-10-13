# Releasing Nadir (Windows) — what exists and what is missing

## What exists and was tested
- `npm run package` builds `out/Nadir-win32-x64/` with `@electron/packager`. `node scripts/verify-package.js` launches that build like a user would and checks it starts, shows its UI, browses a local page and has its hardening applied. Last run: **PACKAGED APP OK** (2026-10-12).
- The GPL-3.0 text ships as `resources/LICENSE`; Electron's own `LICENSE` and `LICENSES.chromium.html` sit next to `Nadir.exe`.
- `scripts/sign.ps1` (`npm run sign`, `npm run package:signed`) signs `Nadir.exe` with Authenticode (SHA-256) and verifies it. **Tested only with a throwaway self-signed certificate on a copy of the exe**: the signature was embedded and read back (status `UnknownError` = untrusted root, as expected), the certificate was removed from the store afterwards, and the real build was left untouched. It has **not** been run with a real certificate or a timestamp server.

## What is missing (cannot be done from inside the repository)
1. **A code-signing certificate.** Without one, Windows SmartScreen shows "unknown publisher" warnings on download. Options, none verified by me against current pricing or terms:
   - **SignPath Foundation** offers certificates to open-source projects. Per its published terms (checked 2026-10-12): OSI-approved licence with no commercial dual-licensing, no proprietary components, project already released and actively maintained, public repository, free downloads, a published code-signing policy on the project home page, and a fully automated build with origin verification. The Foundation, not the project, is the named publisher. Nadir is GPL-3.0 and has no proprietary components of its own, but **cannot apply yet**: the repository is public now, but there is no tagged release, no published code-signing policy and no automated build that can be origin-verified.
   - An **OV/EV certificate** from a commercial CA, or **Azure Trusted Signing** (availability and eligibility vary by region and organisation type; check Microsoft's current terms).
2. **A release process.** The public repository exists (<https://github.com/shipking-ai/nadir>, made public 2026-10-13) and SECURITY.md names a private reporting channel. Still missing: tagged releases, a published code-signing policy page, and a build pipeline that GitHub Actions or SignPath can verify.
3. **An installer** (MSI/NSIS/MSIX) and **auto-update**. Neither is started; both interact with signing (installers must be signed too, and update payloads need an integrity check that does not rely on TLS alone).

## Using `scripts/sign.ps1`
Set one of these environment variables (never put a password on a command line or in the repository):

| Variable | Meaning |
|---|---|
| `NADIR_SIGN_PFX` + `NADIR_SIGN_PFX_PASSWORD` | path to a `.pfx` and its password |
| `NADIR_SIGN_THUMBPRINT` | thumbprint of a certificate in the current user's or the machine's `My` store (hardware tokens usually appear this way) |
| `NADIR_TIMESTAMP_URL` | optional RFC 3161 timestamp server; without it the signature stops validating when the certificate expires. Contacting it sends a hash of the signature to that server. |

Exit codes: `0` signed and valid, `1` error, `2` no certificate configured (nothing signed), `3` signed but Windows does not trust/validate it. `-VerifyOnly` just reports the current signature.

Only `Nadir.exe` is signed: Electron's other binaries keep their upstream signatures (the packaged `Nadir.exe` itself was unsigned in the output, because renaming and re-branding it invalidates Electron's signature).

## Before a public release (checklist)
- [ ] certificate obtained and `npm run package:signed` returns exit code 0 on a clean machine
- [ ] public repository, security contact, code-signing policy page
- [ ] `node scripts/license-inventory.js` clean; Electron licence files present in the package (verified for 0.1.0)
- [ ] `npm audit` clean (0 vulnerabilities on 2026-10-12)
- [ ] unit + e2e + packaged smoke test green
- [ ] trademark check beyond the preliminary one in LICENSES.md
- [ ] decide update channel and its integrity story
