# Clone fix-pack repo + run full autonomous SmartClick setup (Windows).
#
# Usage (PowerShell as Mobar):
#   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
#   cd C:\Users\Mobar\english-explorer-kids\shopify-smartclick\scripts
#   .\run-from-zero.ps1
#
# Or from scratch:
#   cd C:\Users\Mobar
#   git clone https://github.com/amjad2161/english-explorer-kids.git
#   cd english-explorer-kids
#   git checkout cursor/smartclick-setup-8c32
#   cd shopify-smartclick\scripts
#   .\run-from-zero.ps1

param(
  [string]$CloneDir = "C:\Users\Mobar\english-explorer-kids",
  [string]$Branch = "cursor/smartclick-setup-8c32",
  [string]$MobarshamhubRoot = "C:\Users\Mobar\.gemini\antigravity\scratch\mobarshamhub\mobarshamhub",
  [string]$Store = "smartclick-vliwpke0.myshopify.com",
  [switch]$Production
)

if ($Production) {
  $Store = "mobarsham.myshopify.com"
}

$ErrorActionPreference = "Stop"

function Require-Command($name, $installHint) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    Write-Error "$name not found. $installHint"
  }
}

# Git writes progress to stderr; PowerShell must not treat that as a terminating error.
function Invoke-Git {
  param(
    [Parameter(Mandatory = $true, ValueFromRemainingArguments = $true)]
    [string[]]$GitArgs
  )

  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $output = & git @GitArgs 2>&1
  $code = $LASTEXITCODE
  $ErrorActionPreference = $prev

  if ($output) {
    $output | ForEach-Object { Write-Host $_ }
  }

  if ($code -ne 0) {
    throw "git $($GitArgs -join ' ') failed (exit $code)"
  }
}

Require-Command "git" "Install from https://git-scm.com/download/win"
Require-Command "node" "Install LTS from https://nodejs.org"
Require-Command "npm" "Comes with Node.js"

if (-not (Test-Path $CloneDir)) {
  Write-Host "Cloning english-explorer-kids ..."
  $parent = Split-Path $CloneDir -Parent
  if (-not (Test-Path $parent)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
  }
  Invoke-Git clone https://github.com/amjad2161/english-explorer-kids.git $CloneDir
} else {
  Write-Host "Repo exists: $CloneDir"
}

Push-Location $CloneDir
try {
  try {
    Invoke-Git fetch origin $Branch
  } catch {
    Write-Warning "git fetch skipped: $($_.Exception.Message)"
  }

  Invoke-Git checkout $Branch

  try {
    Invoke-Git pull origin $Branch
  } catch {
    Write-Warning "git pull skipped: $($_.Exception.Message)"
  }
} finally {
  Pop-Location
}

$autonomous = Join-Path $CloneDir "shopify-smartclick\scripts\setup-autonomous.ps1"
if (-not (Test-Path $autonomous)) {
  Write-Error "setup-autonomous.ps1 not found at $autonomous. Check branch $Branch."
}

if ($Production) {
  $production = Join-Path $CloneDir "shopify-smartclick\scripts\setup-production.ps1"
  & $production -MobarshamhubRoot $MobarshamhubRoot -Store $Store
} else {
  & $autonomous -MobarshamhubRoot $MobarshamhubRoot -Store $Store
}
