# SmartClick - full Windows setup from zero (fix-pack -> mobarshamhub).
#
# Usage (run in PowerShell):
#   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
#   cd C:\Users\Mobar
#   git clone https://github.com/amjad2161/english-explorer-kids.git
#   cd english-explorer-kids
#   git checkout cursor/smartclick-setup-8c32
#   cd shopify-smartclick\scripts
#   .\setup-windows-fresh.ps1
#
# Or after clone, from shopify-smartclick:
#   .\scripts\setup-windows-fresh.ps1

param(
  [string]$MobarshamhubRoot = "C:\Users\Mobar\.gemini\antigravity\scratch\mobarshamhub\mobarshamhub",
  [string]$Store = "smartclick-vliwpke0.myshopify.com"
)

$ErrorActionPreference = "Stop"
$FixPackRoot = Split-Path -Parent $PSScriptRoot

function Write-Step($n, $msg) {
  Write-Host ""
  Write-Host "=== Step $n : $msg ===" -ForegroundColor Cyan
}

Write-Step 1 "Check Node.js"
$nodeVersion = node -v 2>$null
if (-not $nodeVersion) {
  Write-Error "Node.js not found. Install LTS from https://nodejs.org then reopen PowerShell."
}
Write-Host "Node $nodeVersion"

Write-Step 2 "Check Shopify CLI"
$shopifyCmd = Get-Command shopify -ErrorAction SilentlyContinue
if (-not $shopifyCmd) {
  Write-Host "Installing @shopify/cli globally..."
  npm install -g @shopify/cli@latest
  $npmBin = "$env:APPDATA\npm"
  if ($env:Path -notlike "*$npmBin*") {
    [Environment]::SetEnvironmentVariable(
      "Path",
      [Environment]::GetEnvironmentVariable("Path", "User") + ";$npmBin",
      "User"
    )
    Write-Host "Added $npmBin to user PATH. Close and reopen PowerShell if 'shopify' fails."
  }
}

if (Get-Command shopify -ErrorAction SilentlyContinue) {
  Write-Host "Shopify CLI: $(shopify version)"
} else {
  Write-Host "Shopify CLI via npx: $(npx @shopify/cli version)"
}

Write-Step 3 "Verify mobarshamhub project"
if (-not (Test-Path $MobarshamhubRoot)) {
  Write-Error @"
mobarshamhub not found at:
  $MobarshamhubRoot

Create or clone your Remix app there, or pass:
  .\setup-windows-fresh.ps1 -MobarshamhubRoot `"D:\path\to\mobarshamhub`"
"@
}
Write-Host "Found: $MobarshamhubRoot"

Write-Step 4 "Apply SmartClick fix-pack"
& (Join-Path $PSScriptRoot "apply-to-mobarshamhub.ps1") -TargetRoot $MobarshamhubRoot

Write-Step 5 "Install mobarshamhub dependencies"
Push-Location $MobarshamhubRoot
try {
  if (Test-Path "package-lock.json") {
    npm ci
  } else {
    npm install
  }
} finally {
  Pop-Location
}

Write-Step 6 "Manual TOML merge (required once)"
Write-Host @"
Open these two files in your editor:
  $MobarshamhubRoot\shopify.app.smartclick.toml
  $MobarshamhubRoot\shopify.app.smartclick.toml.smartclick-pack

From the .smartclick-pack file, copy into your real TOML (KEEP your client_id):
  - [access_scopes] scopes line
  - entire [metaobjects.app.qrcode] section and its fields

Save shopify.app.smartclick.toml
"@

Write-Step 7 "Next - two PowerShell windows"

Write-Host @"

WINDOW A - dev server (leave running):
  cd $MobarshamhubRoot
  npm run dev
  -> Log in to Partners if asked
  -> Press p to open the app
  -> Click Update app if scopes changed

WINDOW B - demo product (after WINDOW A is running):
  cd $MobarshamhubRoot
  .\scripts\bootstrap-demo-product.ps1 -Store $Store

WINDOW B alternative if bootstrap script missing:
  `$q = (Get-Content -Raw .\scripts\bootstrap-store.graphql) -replace '(?m)^\s*#.*\r?\n',''
  shopify app execute --store $Store --query `$q

Verify in app:
  Create QR Code -> scan -> product/cart opens -> scan count increases

Dev store admin: https://$Store/admin
"@ -ForegroundColor Green
