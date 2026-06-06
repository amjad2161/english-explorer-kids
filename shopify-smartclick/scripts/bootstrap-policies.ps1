# Apply missing legal policies one mutation at a time (PowerShell-safe).
# Requires: npm run dev + OneClick Hub installed on the store.
#
#   .\bootstrap-policies.ps1
#   .\bootstrap-policies.ps1 -Store mobarsham.myshopify.com

param(
  [string]$Store = "mobarsham.myshopify.com"
)

$ErrorActionPreference = "Stop"

$mutations = @(
  @{
    Name = "Refund"
    Query = @'
mutation { shopPolicyUpdate(shopPolicy: { type: REFUND, body: "<h2>Refund policy</h2><p>OneClick Hub offers refunds on eligible items within 14 days of delivery. Contact mobarsham@gmail.com with your order number.</p>" }) { shopPolicy { id type } userErrors { field message } } }
'@
  },
  @{
    Name = "Shipping"
    Query = @'
mutation { shopPolicyUpdate(shopPolicy: { type: SHIPPING, body: "<h2>Shipping policy</h2><p>We ship across Israel. Processing 1-3 business days. Tracking provided when available.</p>" }) { shopPolicy { id type } userErrors { field message } } }
'@
  },
  @{
    Name = "Terms"
    Query = @'
mutation { shopPolicyUpdate(shopPolicy: { type: TERMS_OF_SERVICE, body: "<h2>Terms of service</h2><p>By using OneClick Hub you agree to these terms. Prices in ILS unless stated otherwise.</p>" }) { shopPolicy { id type } userErrors { field message } } }
'@
  }
)

$cli = if (Get-Command shopify -ErrorAction SilentlyContinue) { "shopify" } else { "npx @shopify/cli" }

foreach ($m in $mutations) {
  Write-Host "Updating $($m.Name) policy on $Store ..."
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    if ($cli -eq "shopify") {
      shopify app execute --store $Store --query $m.Query
      if ($LASTEXITCODE -ne 0) { Write-Warning "$($m.Name) policy update failed" }
    } else {
      npx @shopify/cli app execute --store $Store --query $m.Query
      if ($LASTEXITCODE -ne 0) { Write-Warning "$($m.Name) policy update failed" }
    }
  } finally {
    $ErrorActionPreference = $prev
  }
}

Write-Host "Done. Re-run: python audit-store-public.py $Store" -ForegroundColor Green
