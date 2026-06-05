# Create a demo product on the dev store (PowerShell-safe — no @file syntax).
# Requires: npm run dev running in another terminal.
#
# Usage:
#   .\scripts\bootstrap-demo-product.ps1
#   .\scripts\bootstrap-demo-product.ps1 -Store smartclick-vliwpke0.myshopify.com

param(
  [string]$Store = "smartclick-vliwpke0.myshopify.com",
  [string]$GraphqlFile = ""
)

$ErrorActionPreference = "Stop"

if (-not $GraphqlFile) {
  $GraphqlFile = Join-Path $PSScriptRoot "bootstrap-store.graphql"
}

if (-not (Test-Path $GraphqlFile)) {
  Write-Error "GraphQL file not found: $GraphqlFile`nRun apply-to-mobarshamhub.ps1 first."
}

$shopifyCmd = Get-Command shopify -ErrorAction SilentlyContinue
if ($shopifyCmd) {
  $cli = "shopify"
} else {
  $cli = "npx @shopify/cli"
  Write-Host "Using: npx @shopify/cli (shopify not on PATH)"
}

$query = (Get-Content -Raw $GraphqlFile) -replace '(?m)^\s*#.*\r?\n', ''

Write-Host "Creating demo product on $Store ..."
Write-Host "(Keep npm run dev running in another terminal.)"
Write-Host ""

if ($cli -eq "shopify") {
  shopify app execute --store $Store --query $query
} else {
  npx @shopify/cli app execute --store $Store --query $query
}
