# Copy SmartClick fix-pack files into your local mobarshamhub Remix app.
# Usage:
#   .\scripts\apply-to-mobarshamhub.ps1
#   .\scripts\apply-to-mobarshamhub.ps1 -TargetRoot "D:\path\to\mobarshamhub"

param(
  [string]$TargetRoot = "C:\Users\Mobar\.gemini\antigravity\scratch\mobarshamhub\mobarshamhub"
)

$ErrorActionPreference = "Stop"
$SourceRoot = Split-Path -Parent $PSScriptRoot

if (-not (Test-Path $TargetRoot)) {
  Write-Error "Target project not found: $TargetRoot`nPass -TargetRoot with your mobarshamhub path."
}

$files = @(
  @{
    Source = Join-Path $SourceRoot "app\models\QRCode.server.js"
    Target = Join-Path $TargetRoot "app\models\QRCode.server.js"
  },
  @{
    Source = Join-Path $SourceRoot "app\routes\qrcodes.`$id.scan.jsx"
    Target = Join-Path $TargetRoot "app\routes\qrcodes.`$id.scan.jsx"
  },
  @{
    Source = Join-Path $SourceRoot "scripts\bootstrap-store.graphql"
    Target = Join-Path $TargetRoot "scripts\bootstrap-store.graphql"
  }
)

foreach ($file in $files) {
  $targetDir = Split-Path -Parent $file.Target
  if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
  }
  Copy-Item -Path $file.Source -Destination $file.Target -Force
  Write-Host "Copied -> $($file.Target)"
}

$tomlSource = Join-Path $SourceRoot "shopify.app.smartclick.toml"
$tomlTarget = Join-Path $TargetRoot "shopify.app.smartclick.toml"
$tomlReference = Join-Path $TargetRoot "shopify.app.smartclick.toml.smartclick-pack"

Copy-Item -Path $tomlSource -Destination $tomlReference -Force
Write-Host "Wrote reference TOML -> $tomlReference"
Write-Host ""
Write-Host "Manual step: merge [access_scopes] and [metaobjects.app.qrcode] from the reference file"
Write-Host "into $tomlTarget while keeping your real client_id and URLs."
Write-Host "Optional UI patch: patches\app._index.destinationBroken.snippet.jsx"
Write-Host ""
Write-Host "Next:"
Write-Host "  cd $TargetRoot"
Write-Host "  npm run dev"
Write-Host "  shopify app execute --store smartclick-vliwpke0.myshopify.com --query @scripts/bootstrap-store.graphql"
