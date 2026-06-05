# SmartClick — fully automated Windows setup (fix-pack → merge TOML → dev → demo product).
#
# One command after mobarshamhub exists:
#   cd english-explorer-kids\shopify-smartclick\scripts
#   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
#   .\setup-autonomous.ps1
#
# Zero to running (includes git clone):
#   .\run-from-zero.ps1
#
# First run only: complete Shopify login in the dev window that opens automatically.

param(
  [string]$MobarshamhubRoot = "C:\Users\Mobar\.gemini\antigravity\scratch\mobarshamhub\mobarshamhub",
  [string]$Store = "smartclick-vliwpke0.myshopify.com",
  [int]$DevReadyTimeoutSeconds = 600,
  [switch]$SkipBootstrap,
  [switch]$SkipDevServer
)

$ErrorActionPreference = "Stop"
$FixPackRoot = Split-Path -Parent $PSScriptRoot

function Write-Step($n, $msg) {
  Write-Host ""
  Write-Host "=== [$n] $msg ===" -ForegroundColor Cyan
}

function Get-ShopifyCli {
  if (Get-Command shopify -ErrorAction SilentlyContinue) { return "shopify" }
  return "npx @shopify/cli"
}

function Invoke-ShopifyAppExecute {
  param([string]$Query)
  $cli = Get-ShopifyCli
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    if ($cli -eq "shopify") {
      return (shopify app execute --store $Store --query $Query 2>&1 | Out-String)
    }
    return (npx @shopify/cli app execute --store $Store --query $Query 2>&1 | Out-String)
  } finally {
    $ErrorActionPreference = $prev
  }
}

Write-Host @"

SmartClick autonomous setup
  App:    $MobarshamhubRoot
  Store:  $Store

"@ -ForegroundColor Yellow

Write-Step 1 "Node.js + Shopify CLI"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error "Node.js not found. Install from https://nodejs.org"
}
Write-Host "Node $(node -v)"

if (-not (Get-Command shopify -ErrorAction SilentlyContinue)) {
  Write-Host "Installing Shopify CLI ..."
  npm install -g @shopify/cli@latest
  $npmBin = "$env:APPDATA\npm"
  if ($env:Path -notlike "*$npmBin*") {
    [Environment]::SetEnvironmentVariable(
      "Path",
      [Environment]::GetEnvironmentVariable("Path", "User") + ";$npmBin",
      "User"
    )
  }
}
Write-Host "CLI: $(Get-ShopifyCli) $(if (Get-Command shopify -ErrorAction SilentlyContinue) { shopify version })"

Write-Step 2 "Verify mobarshamhub"
if (-not (Test-Path $MobarshamhubRoot)) {
  Write-Error "mobarshamhub not found at $MobarshamhubRoot"
}

Write-Step 3 "Apply fix-pack"
& (Join-Path $PSScriptRoot "apply-to-mobarshamhub.ps1") -TargetRoot $MobarshamhubRoot

Write-Step 4 "Install dependencies"
Push-Location $MobarshamhubRoot
try {
  if (Test-Path "package-lock.json") { npm ci } else { npm install }
} finally {
  Pop-Location
}

Write-Step 5 "Auto-merge shopify.app.smartclick.toml"
$targetToml = Join-Path $MobarshamhubRoot "shopify.app.smartclick.toml"
$packToml = Join-Path $MobarshamhubRoot "shopify.app.smartclick.toml.smartclick-pack"
if (-not (Test-Path $packToml)) {
  $packToml = Join-Path $FixPackRoot "shopify.app.smartclick.toml"
}
& (Join-Path $PSScriptRoot "merge-smartclick-toml.ps1") -TargetToml $targetToml -PackToml $packToml

if (-not $SkipDevServer) {
  Write-Step 6 "Start dev server (new window — log in once if prompted)"
  $devCommand = "Set-Location '$MobarshamhubRoot'; npm run dev"
  Start-Process powershell -ArgumentList @("-NoExit", "-Command", $devCommand) | Out-Null
  Write-Host "Dev window opened. If asked, log in to Partners and press p to preview."

  Write-Step 7 "Wait for app session"
  & (Join-Path $PSScriptRoot "wait-for-shopify-app.ps1") `
    -Store $Store `
    -TimeoutSeconds $DevReadyTimeoutSeconds
} else {
  Write-Host "SkipDevServer: assuming npm run dev is already running."
}

if (-not $SkipBootstrap) {
  Write-Step 8 "Bootstrap demo product (skip if already exists)"
  $listQuery = '{ products(first: 10, query: "title:SmartClick Classic Tee") { nodes { title handle } } }'
  $existing = Invoke-ShopifyAppExecute -Query $listQuery

  if ($existing -match "SmartClick Classic Tee") {
    Write-Host "Demo product already exists." -ForegroundColor Green
  } else {
    & (Join-Path $MobarshamhubRoot "scripts\bootstrap-demo-product.ps1") -Store $Store
  }
}

Write-Step 9 "Store product list"
Invoke-ShopifyAppExecute -Query '{ products(first: 5) { nodes { title handle } } }'

Write-Host @"

=== Autonomous setup complete ===

Admin products: https://$Store/admin/products

In the dev window press p, then in the app:
  Create QR Code -> pick a product -> save -> scan

Keep the dev server window running.

"@ -ForegroundColor Green
