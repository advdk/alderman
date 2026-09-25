# Creates the Google Play *upload key* for this game and android/keystore.properties.
# The key is named after "name" in package.json: <name>-upload (alias) and <name>-upload.jks (file).
# Run it yourself, once:   powershell -ExecutionPolicy Bypass -File tools\make-upload-key.ps1
#
# - The key is stored OUTSIDE the project: %USERPROFILE%\.android-keys\<name>-upload.jks
# - Put the password in your password manager and back up the .jks file (e.g. in the password manager too).
#   With Play App Signing a lost upload key can be reset through Play support, but it takes days.
$ErrorActionPreference = 'Stop'
$name  = (Get-Content (Join-Path $PSScriptRoot '..\package.json') -Raw | ConvertFrom-Json).name
$alias = "$name-upload"
$org   = if ($env:UPLOAD_KEY_ORG) { $env:UPLOAD_KEY_ORG } else { 'Midnight Syntax Labs' }
$dir = Join-Path $env:USERPROFILE '.android-keys'
$ks  = Join-Path $dir "$alias.jks"
$props = Join-Path $PSScriptRoot '..\android\keystore.properties'
if (Test-Path $ks) { Write-Host "An upload key already exists: $ks  (nothing changed)"; exit 1 }
New-Item -ItemType Directory -Force $dir | Out-Null

function Read-Plain($prompt) {
  $s = Read-Host $prompt -AsSecureString
  [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($s))
}
do {
  $pw  = Read-Plain 'Choose a password for the upload key (at least 8 characters)'
  $pw2 = Read-Plain 'Type it again'
  if ($pw -ne $pw2) { Write-Host 'The two passwords differ. Try again.' }
  elseif ($pw.Length -lt 8) { Write-Host 'Too short. Try again.' }
} until ($pw -eq $pw2 -and $pw.Length -ge 8)

keytool -genkeypair -keystore $ks -storetype PKCS12 -alias $alias -keyalg RSA -keysize 4096 -validity 10000 `
  -storepass $pw -keypass $pw -dname "CN=$org, O=$org, C=DK"

@"
storeFile=$($ks -replace '\\','/')
storePassword=$pw
keyAlias=$alias
keyPassword=$pw
"@ | Set-Content -Encoding ASCII $props

Write-Host "`nUpload key created: $ks"
Write-Host "Gradle signing settings written to android\keystore.properties (never commit this file).`n"
keytool -list -v -keystore $ks -alias $alias -storepass $pw | Select-String 'SHA1:|SHA256:'
Write-Host "`nNow tell Claude the key is ready. Store the password and a copy of the .jks in your password manager."
