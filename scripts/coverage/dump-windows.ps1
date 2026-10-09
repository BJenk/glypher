# Record which codepoints Windows' built-in fonts cover, for Glypher's
# portability ranking. Run on a stock Windows machine (no installs needed):
#
#   powershell -ExecutionPolicy Bypass -File scripts\coverage\dump-windows.ps1
#
# Writes vendor\coverage\windows.json in the same format as dump_cmaps.py.
# It reads C:\Windows\Fonts only; fonts installed per-user live elsewhere and
# are skipped, but fonts an admin installed system-wide will be counted, so
# use a machine without extra fonts.

Add-Type -AssemblyName PresentationCore

$cps = New-Object 'System.Collections.Generic.HashSet[int]'
$count = 0
Get-ChildItem "$env:WINDIR\Fonts" -File |
  Where-Object { $_.Extension -match '^\.(ttf|otf|ttc)$' } |
  ForEach-Object {
    $file = $_.FullName
    # A .ttc holds several faces; GlyphTypeface addresses each by #index.
    $faces = if ($_.Extension -eq '.ttc') { 0..31 } else { @($null) }
    foreach ($i in $faces) {
      $uri = if ($null -eq $i) { New-Object Uri $file } else { New-Object Uri ("$file#$i") }
      try {
        $face = New-Object System.Windows.Media.GlyphTypeface $uri
        foreach ($cp in $face.CharacterToGlyphMap.Keys) { [void]$cps.Add($cp) }
      } catch {
        if ($null -eq $i) { Write-Warning "skip $file : $($_.Exception.Message)" }
        break  # past the last face of a collection
      }
    }
    $count++
  }

$sorted = [int[]]@($cps) | Sort-Object
$ranges = New-Object System.Collections.Generic.List[object]
foreach ($cp in $sorted) {
  if ($ranges.Count -gt 0 -and $cp -eq $ranges[$ranges.Count - 1][1] + 1) {
    $ranges[$ranges.Count - 1][1] = $cp
  } else {
    $ranges.Add(@($cp, $cp))
  }
}

$os = (Get-CimInstance Win32_OperatingSystem)
$source = "$($os.Caption -replace '^Microsoft ', '') (build $($os.BuildNumber))"
$json = [ordered]@{
  id       = 'windows'
  name     = 'Windows'
  source   = $source
  fonts    = $count
  measured = (Get-Date -Format 'yyyy-MM-dd')
  ranges   = $ranges
} | ConvertTo-Json -Compress -Depth 4

$out = Join-Path $PSScriptRoot '..\..\vendor\coverage\windows.json'
[IO.File]::WriteAllText($out, $json)
Write-Output "windows: $count fonts, $($cps.Count) codepoints -> $out"
