# OneClick Hub production store setup (mobarsham.myshopify.com).
#
# Prerequisites:
#   1. mobarshamhub exists locally (see setup-autonomous.ps1)
#   2. OneClick Hub app installed on mobarsham.myshopify.com (Partners > Test on store)
#   3. npm run dev running OR deployed app with valid session
#
# Usage:
#   cd shopify-smartclick\scripts
#   .\setup-production.ps1
#   .\setup-production.ps1 -SkipDevServer   # dev already running
#   .\setup-production.ps1 -AuditOnly         # public audit only

param(
  [string]$MobarshamhubRoot = "C:\Users\Mobar\.gemini\antigravity\scratch\mobarshamhub\mobarshamhub",
  [string]$Store = "mobarsham.myshopify.com",
  [int]$DevReadyTimeoutSeconds = 600,
  [switch]$SkipBootstrap,
  [switch]$SkipDevServer,
  [switch]$AuditOnly
)

$ErrorActionPreference = "Stop"
$FixPackRoot = Split-Path -Parent $PSScriptRoot

function Write-Step($n, $msg) {
  Write-Host ""
  Write-Host "=== [$n] $msg ===" -ForegroundColor Cyan
}

Write-Host @"

OneClick Hub PRODUCTION setup
  App:    $MobarshamhubRoot
  Store:  $Store

"@ -ForegroundColor Yellow

Write-Step 1 "Public storefront audit (no token needed)"
$auditScript = Join-Path $PSScriptRoot "audit-store-public.py"
if (Get-Command python -ErrorAction SilentlyContinue) {
  python $auditScript $Store
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
  python3 $auditScript $Store
} else {
  Write-Warning "Python not found - skip audit or install Python 3"
}

if ($AuditOnly) {
  Write-Host "AuditOnly: done." -ForegroundColor Green
  exit 0
}

Write-Step 2 "Apply fix-pack + merge TOML for production app"
& (Join-Path $PSScriptRoot "setup-autonomous.ps1") `
  -MobarshamhubRoot $MobarshamhubRoot `
  -Store $Store `
  -DevReadyTimeoutSeconds $DevReadyTimeoutSeconds `
  -SkipBootstrap:(-not $SkipBootstrap) `
  -SkipDevServer:$SkipDevServer

Write-Step 3 "Bootstrap legal policies (if Admin session works)"
if (-not $SkipBootstrap) {
  try {
    & (Join-Path $PSScriptRoot "bootstrap-policies.ps1") -Store $Store
  } catch {
    Write-Warning "Policy bootstrap skipped (login or install app on production store first)."
  }
}

Write-Step 4 "Re-run public audit"
if (Get-Command python -ErrorAction SilentlyContinue) {
  python $auditScript $Store
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
  python3 $auditScript $Store
}

Write-Host @"

=== Production setup pass complete ===

Storefront:  https://$Store/
Admin:       https://$Store/admin
Products:    https://$Store/admin/products

Manual checklist (Admin):
  Settings > Payments     - enable Shopify Payments or provider
  Settings > Shipping     - add Israel rates
  Settings > Policies     - review refund/shipping/terms text
  Online Store > Themes   - publish theme if password protected
  Apps > OneClick Hub     - Update app if scopes changed

Do NOT paste shpat_ / shpss_ / atkn_ tokens in chat. Use .env locally.

"@ -ForegroundColor Green
