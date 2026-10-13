# Sums memory and CPU time over a process and all its descendants (same method for every browser measured).
param([Parameter(Mandatory)][int]$RootPid)
$all = Get-CimInstance Win32_Process | Select-Object ProcessId, ParentProcessId
$ids = New-Object System.Collections.Generic.HashSet[int]
[void]$ids.Add($RootPid)
do { $before = $ids.Count
  foreach ($p in $all) { if ($ids.Contains([int]$p.ParentProcessId) -and -not $ids.Contains([int]$p.ProcessId)) { [void]$ids.Add([int]$p.ProcessId) } }
} while ($ids.Count -ne $before)
$ws = 0L; $priv = 0L; $cpu = 0.0; $n = 0; $byPid = @{}
foreach ($id in $ids) {
  $pr = Get-Process -Id $id -ErrorAction SilentlyContinue
  if ($pr) { $n++; $ws += $pr.WorkingSet64; $priv += $pr.PrivateMemorySize64; try { $c = $pr.TotalProcessorTime.TotalSeconds; $cpu += $c; $byPid[[string]$id] = [math]::Round($c, 3) } catch {} }
}
[pscustomobject]@{ processes = $n; workingSetMB = [math]::Round($ws / 1MB, 1); privateMB = [math]::Round($priv / 1MB, 1); cpuSeconds = [math]::Round($cpu, 3); pids = $byPid } | ConvertTo-Json -Compress
