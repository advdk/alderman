# Puts the GitHub Actions signing secrets on your clipboard, one at a time, so you can paste them into
# GitHub -> <repo> -> Settings -> Environments -> google-play -> Environment secrets.
# Nothing is printed or sent anywhere; run it yourself after tools\make-upload-key.ps1:
#   powershell -ExecutionPolicy Bypass -File tools\copy-ci-secrets.ps1
$ErrorActionPreference = 'Stop'
$props = Join-Path $PSScriptRoot '..\android\keystore.properties'
if (-not (Test-Path $props)) { Write-Host 'android\keystore.properties not found. Run tools\make-upload-key.ps1 first.'; exit 1 }
$p = @{}; Get-Content $props | ForEach-Object { if ($_ -match '^\s*([^#=]+?)\s*=\s*(.*)$') { $p[$matches[1]] = $matches[2] } }
$ks = $p['storeFile'] -replace '/', '\'
if (-not (Test-Path $ks)) { Write-Host "Keystore not found: $ks"; exit 1 }

$items = [ordered]@{
  'ANDROID_KEYSTORE_BASE64'   = [Convert]::ToBase64String([IO.File]::ReadAllBytes($ks))
  'ANDROID_KEYSTORE_PASSWORD' = $p['storePassword']
  'ANDROID_KEY_PASSWORD'      = $p['keyPassword']
}
Write-Host "In GitHub open: Settings -> Environments -> google-play -> Add environment secret.`n"
foreach ($name in $items.Keys) {
  Set-Clipboard -Value $items[$name]
  Read-Host "Copied the value for $name. Create the secret with that name, paste, save, then press Enter"
}
Set-Clipboard -Value ' '
Write-Host "`nDone. The clipboard is cleared."
