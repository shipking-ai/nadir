# SPDX-License-Identifier: GPL-3.0-or-later
# Authenticode-signs the packaged Nadir.exe and verifies the result. Needs a code-signing certificate, which this
# repository does not and cannot contain. Configure ONE of:
#   NADIR_SIGN_PFX (+ NADIR_SIGN_PFX_PASSWORD)   path to a .pfx file; the password is read from the environment only
#   NADIR_SIGN_THUMBPRINT                        SHA-1 thumbprint of a certificate in Cert:\CurrentUser\My or LocalMachine\My
# Optional: NADIR_TIMESTAMP_URL (RFC 3161 server; without a timestamp the signature stops validating when the cert expires).
# Usage:  powershell -File scripts/sign.ps1 [-Path out\Nadir-win32-x64\Nadir.exe] [-VerifyOnly]
# Exit codes: 0 signed and valid · 1 error · 2 no certificate configured · 3 signed but not trusted/valid
param(
  [string]$Path = (Join-Path $PSScriptRoot '..\out\Nadir-win32-x64\Nadir.exe'),
  [switch]$VerifyOnly
)
$ErrorActionPreference = 'Stop'
$Path = (Resolve-Path $Path).Path

function Show-Signature($p) {
  $s = Get-AuthenticodeSignature -FilePath $p
  Write-Host ("status      : {0}" -f $s.Status)
  if ($s.SignerCertificate) {
    Write-Host ("subject     : {0}" -f $s.SignerCertificate.Subject)
    Write-Host ("thumbprint  : {0}" -f $s.SignerCertificate.Thumbprint)
    Write-Host ("not after   : {0:yyyy-MM-dd}" -f $s.SignerCertificate.NotAfter)
  }
  Write-Host ("timestamped : {0}" -f ($null -ne $s.TimeStamperCertificate))
  return $s
}

if ($VerifyOnly) { $s = Show-Signature $Path; if ($s.Status -eq 'Valid') { exit 0 } else { exit 3 } }

$cert = $null
if ($env:NADIR_SIGN_PFX) {
  $pw = if ($env:NADIR_SIGN_PFX_PASSWORD) { ConvertTo-SecureString $env:NADIR_SIGN_PFX_PASSWORD -AsPlainText -Force } else { $null }
  # Windows PowerShell 5.1's Get-PfxCertificate has no -Password parameter, so use the .NET type directly.
  $cert = if ($pw) { New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($env:NADIR_SIGN_PFX, $pw) } else { New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($env:NADIR_SIGN_PFX) }
} elseif ($env:NADIR_SIGN_THUMBPRINT) {
  $cert = Get-ChildItem Cert:\CurrentUser\My, Cert:\LocalMachine\My | Where-Object Thumbprint -eq $env:NADIR_SIGN_THUMBPRINT | Select-Object -First 1
  if (-not $cert) { Write-Error "No certificate with thumbprint $env:NADIR_SIGN_THUMBPRINT"; exit 1 }
} else {
  Write-Host 'No signing certificate configured (set NADIR_SIGN_PFX or NADIR_SIGN_THUMBPRINT). Nothing was signed.'
  exit 2
}
if (-not ($cert.EnhancedKeyUsageList | Where-Object { $_.ObjectId -eq '1.3.6.1.5.5.7.3.3' })) {
  Write-Error 'The certificate does not have the Code Signing EKU (1.3.6.1.5.5.7.3.3).'; exit 1
}

$args2 = @{ FilePath = $Path; Certificate = $cert; HashAlgorithm = 'SHA256' }
if ($env:NADIR_TIMESTAMP_URL) { $args2.TimestampServer = $env:NADIR_TIMESTAMP_URL }
$null = Set-AuthenticodeSignature @args2
$s = Show-Signature $Path
if ($s.Status -eq 'Valid') { exit 0 }
Write-Host 'Signed, but Windows does not consider the signature valid/trusted (expected for a self-signed test certificate).'
exit 3
