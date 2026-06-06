#!/usr/bin/env bash
# Copy SmartClick fix-pack files into your local mobarshamhub Remix app.
# Usage:
#   ./scripts/apply-to-mobarshamhub.sh
#   ./scripts/apply-to-mobarshamhub.sh /path/to/mobarshamhub

set -euo pipefail

TARGET_ROOT="${1:-$HOME/.gemini/antigravity/scratch/mobarshamhub/mobarshamhub}"
SOURCE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ ! -d "$TARGET_ROOT" ]]; then
  echo "Target project not found: $TARGET_ROOT" >&2
  echo "Pass your mobarshamhub path as the first argument." >&2
  exit 1
fi

copy_file() {
  local src="$1"
  local dest="$2"
  mkdir -p "$(dirname "$dest")"
  cp "$src" "$dest"
  echo "Copied -> $dest"
}

copy_file "$SOURCE_ROOT/app/models/QRCode.server.js" "$TARGET_ROOT/app/models/QRCode.server.js"
copy_file "$SOURCE_ROOT/app/routes/qrcodes.\$id.scan.jsx" "$TARGET_ROOT/app/routes/qrcodes.\$id.scan.jsx"
copy_file "$SOURCE_ROOT/scripts/bootstrap-store.graphql" "$TARGET_ROOT/scripts/bootstrap-store.graphql"

TOML_REFERENCE="$TARGET_ROOT/shopify.app.smartclick.toml.smartclick-pack"
cp "$SOURCE_ROOT/shopify.app.smartclick.toml" "$TOML_REFERENCE"
echo "Wrote reference TOML -> $TOML_REFERENCE"
echo
echo "Manual step: merge [access_scopes] and [metaobjects.app.qrcode] from the reference file"
echo "into $TARGET_ROOT/shopify.app.smartclick.toml while keeping your real client_id and URLs."
echo
echo "Optional UI patch: see patches/app._index.destinationBroken.snippet.jsx"
echo
echo "Next:"
echo "  cd $TARGET_ROOT"
echo "  npm run dev"
echo "  shopify app execute --store smartclick-vliwpke0.myshopify.com --query @scripts/bootstrap-store.graphql"
