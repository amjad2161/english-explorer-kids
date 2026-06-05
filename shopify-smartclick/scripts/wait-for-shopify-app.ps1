# Wait until `shopify app execute` works (dev server installed + authenticated).
#
# Usage:
#   .\scripts\wait-for-shopify-app.ps1 -Store smartclick-vliwpke0.myshopify.com

param(
  [string]$Store = "smartclick-vliwpke0.myshopify.com",
  [int]$TimeoutSeconds = 600,
  [int]$IntervalSeconds = 15
)

$ErrorActionPreference = "Stop"

$shopifyCmd = Get-Command shopify -ErrorAction SilentlyContinue
if ($shopifyCmd) {
  $cli = "shopify"
} else {
  $cli = "npx @shopify/cli"
}

$query = "{ shop { name } }"
$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
$attempt = 0

Write-Host "Waiting for Shopify app session on $Store (timeout ${TimeoutSeconds}s)..."
Write-Host "If this is your first run, complete browser login in the dev server window."

while ((Get-Date) -lt $deadline) {
  $attempt++
  Write-Host "  Attempt $attempt ..."

  try {
    if ($cli -eq "shopify") {
      $out = shopify app execute --store $Store --query $query 2>&1 | Out-String
    } else {
      $out = npx @shopify/cli app execute --store $Store --query $query 2>&1 | Out-String
    }

    if ($out -match '"name"' -or $out -match '"shop"') {
      Write-Host "App session ready." -ForegroundColor Green
      return
    }

    Write-Host "  Not ready yet: $($out.Trim().Substring(0, [Math]::Min(200, $out.Trim().Length)))"
  } catch {
    Write-Host "  Retry: $($_.Exception.Message)"
  }

  Start-Sleep -Seconds $IntervalSeconds
}

Write-Error "Timed out after ${TimeoutSeconds}s. Ensure 'npm run dev' is running and you logged in via browser."
