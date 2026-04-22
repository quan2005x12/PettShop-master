param(
  [Parameter(Mandatory = $true)]
  [string]$SourceDir
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -Path $SourceDir)) {
  throw "SourceDir not found: $SourceDir"
}

$targetDir = Join-Path $PSScriptRoot '..\public\images\shutterstock'
$targetDir = (Resolve-Path -Path $targetDir).Path

$map = @{
  'hero-dog' = 'hero-dog'
  'testimonial-milo' = 'testimonial-milo'
  'testimonial-luna' = 'testimonial-luna'
  'testimonial-bean' = 'testimonial-bean'
}

$allowedExt = @('jpg', 'jpeg', 'png', 'webp')

foreach ($key in $map.Keys) {
  $match = Get-ChildItem -Path $SourceDir -File |
    Where-Object {
      $name = $_.BaseName.ToLowerInvariant()
      $ext = $_.Extension.TrimStart('.').ToLowerInvariant()
      $name -eq $key -and ($allowedExt -contains $ext)
    } |
    Select-Object -First 1

  if (-not $match) {
    throw "Missing file '$key' in $SourceDir. Expected one of: $($allowedExt -join ', ')"
  }

  $dest = Join-Path $targetDir ($map[$key] + '.jpg')
  Copy-Item -Path $match.FullName -Destination $dest -Force
}

Write-Host 'Imported Shutterstock images successfully:'
Get-ChildItem -Path $targetDir -File |
  Where-Object { $_.Name -like 'hero-dog.jpg' -or $_.Name -like 'testimonial-*.jpg' } |
  Select-Object Name, Length
