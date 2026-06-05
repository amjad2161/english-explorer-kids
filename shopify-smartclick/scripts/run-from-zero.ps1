# Clone fix-pack repo + run full autonomous SmartClick setup (Windows).
#
# Usage (PowerShell as Mobar):
#   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
#   iwr -useb https://raw.githubusercontent.com/amjad2161/english-explorer-kids/cursor/smartclick-setup-8c32/shopify-smartclick/scripts/run-from-zero.ps1 -OutFile $env:TEMP\run-from-zero.ps1
#   & $env:TEMP\run-from-zero.ps1
#
# Or after git is installed:
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
  [string]$Store = "smartclick-vliwpke0.myshopify.com"
)

$ErrorActionPreference = "Stop"

function Require-Command($name, $installHint) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    Write-Error "$name not found. $installHint"
  }
}

Require-Command "git" "Install from https://git-scm.com/download/win"
Require-Command "node" "Install LTS from https://nodejs.org"
Require-Command "npm" "Comes with Node.js"

if (-not (Test-Path $CloneDir)) {
  Write-Host "Cloning english-explorer-kids ..."
  $parent = Split-Path $CloneDir -Parent
  if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
  git clone https://github.com/amjad2161/english-explorer-kids.git $CloneDir
} else {
  Write-Host "Repo exists: $CloneDir"
}

Push-Location $CloneDir
try {
  git fetch origin $Branch 2>$null
  git checkout $Branch
  git pull origin $Branch 2>$null
} finally {
  Pop-Location
}

$autonomous = Join-Path $CloneDir "shopify-smartclick\scripts\setup-autonomous.ps1"
if (-not (Test-Path $autonomous)) {
  Write-Error "setup-autonomous.ps1 not found. Check branch $Branch is checked out."
}

& $autonomous -MobarshamhubRoot $MobarshamhubRoot -Store $Store
