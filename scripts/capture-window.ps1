# Captures ONE window (by HWND) using PrintWindow, so nothing else on the desktop is read.
# Usage: powershell -File capture-window.ps1 -Hwnd <decimal> -Out <png>
param([Parameter(Mandatory)][Int64]$Hwnd, [Parameter(Mandatory)][string]$Out)
Add-Type -AssemblyName System.Drawing
Add-Type @'
using System; using System.Runtime.InteropServices;
public static class W {
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr dc, uint flags);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
}
'@
[void][W]::SetProcessDPIAware()   # otherwise Windows reports a scaled-down window rect and the capture is cropped
$h = [IntPtr]$Hwnd
$r = New-Object W+RECT
[void][W]::GetWindowRect($h, [ref]$r)
$w = $r.R - $r.L; $ht = $r.B - $r.T
if ($w -le 0 -or $ht -le 0) { throw "Window has no size" }
$bmp = New-Object System.Drawing.Bitmap $w, $ht
$g = [System.Drawing.Graphics]::FromImage($bmp)
$dc = $g.GetHdc()
[void][W]::PrintWindow($h, $dc, 2)   # 2 = PW_RENDERFULLCONTENT
$g.ReleaseHdc($dc); $g.Dispose()
$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Output "saved ${w}x${ht}"
