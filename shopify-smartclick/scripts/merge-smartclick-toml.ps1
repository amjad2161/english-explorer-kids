# Auto-merge SmartClick fix-pack TOML into mobarshamhub (keeps client_id, URLs, webhooks).
#
# Usage:
#   .\scripts\merge-smartclick-toml.ps1
#   .\scripts\merge-smartclick-toml.ps1 -TargetToml D:\app\shopify.app.smartclick.toml -PackToml D:\pack\shopify.app.smartclick.toml

param(
  [string]$TargetToml = "",
  [string]$PackToml = ""
)

$ErrorActionPreference = "Stop"

function Get-TomlSection {
  param(
    [string]$Content,
    [string]$SectionPattern,
    [switch]$ToEnd
  )

  if ($ToEnd) {
    if ($Content -match "(?s)$SectionPattern(.*)$") {
      return $Matches[0].TrimEnd()
    }
    return $null
  }

  if ($Content -match "(?s)($SectionPattern(?:(?!\n\[).)*)") {
    return $Matches[1].TrimEnd()
  }
  return $null
}

if (-not $TargetToml) {
  $TargetToml = Join-Path $PSScriptRoot "..\shopify.app.smartclick.toml"
  if (-not (Test-Path $TargetToml)) {
    $TargetToml = Join-Path (Split-Path $PSScriptRoot -Parent) "shopify.app.smartclick.toml"
  }
}

if (-not $PackToml) {
  $PackToml = Join-Path $PSScriptRoot "..\shopify.app.smartclick.toml"
}

if (-not (Test-Path $TargetToml)) {
  Write-Error "Target TOML not found: $TargetToml"
}
if (-not (Test-Path $PackToml)) {
  Write-Error "Pack TOML not found: $PackToml"
}

$target = Get-Content -Raw $TargetToml
$pack = Get-Content -Raw $PackToml

if ($target -notmatch 'client_id\s*=\s*"([^"]+)"') {
  Write-Error "Target TOML has no client_id: $TargetToml"
}
$clientId = $Matches[1]
if ($clientId -eq "REPLACE_WITH_CLIENT_ID") {
  Write-Error "Set a real client_id in $TargetToml before merging (Partners > smartclick > Client credentials)."
}

$accessScopes = Get-TomlSection -Content $pack -SectionPattern '\[access_scopes\]'
$metaobjects = Get-TomlSection -Content $pack -SectionPattern '\[metaobjects\.app\.qrcode\]' -ToEnd

if (-not $accessScopes -or -not $metaobjects) {
  Write-Error "Pack TOML missing [access_scopes] or [metaobjects.app.qrcode] sections."
}

$head = $target
if ($head -match '(?s)(\[access_scopes\].*$)') {
  $head = $head -replace '(?s)\[access_scopes\].*$', ''
}
if ($head -match '(?s)(\[metaobjects\.app\.qrcode\].*$)') {
  $head = $head -replace '(?s)\[metaobjects\.app\.qrcode\].*$', ''
}
$head = $head.TrimEnd()

$authBlock = Get-TomlSection -Content $target -SectionPattern '\[auth\]'
if (-not $authBlock) {
  $authBlock = Get-TomlSection -Content $pack -SectionPattern '\[auth\]'
}

$merged = @(
  $head
  ""
  $accessScopes
  ""
  $authBlock
  ""
  $metaobjects
  ""
) -join "`n"

Set-Content -Path $TargetToml -Value $merged -Encoding utf8
Write-Host "Merged SmartClick TOML -> $TargetToml (client_id preserved: $clientId)"
