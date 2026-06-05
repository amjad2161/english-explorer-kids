# SmartClick — fix & store bootstrap

This folder contains the **official Shopify QR-code fix** and setup files for your local project at:

`C:\Users\Mobar\.gemini\antigravity\scratch\mobarshamhub\mobarshamhub`

## Autonomous setup (Windows, one command)

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
cd C:\Users\Mobar\english-explorer-kids\shopify-smartclick\scripts
.\run-from-zero.ps1
```

Does: clone/update fix-pack → apply patches → merge TOML → open dev server → wait for auth → create demo product.

First run only: log in to Partners in the browser window that opens. See [SETUP-WINDOWS.md](./SETUP-WINDOWS.md).

## 1. Security (do this first)

You pasted Admin API tokens in chat. **Rotate them now:**

1. [Shopify Partners](https://partners.shopify.com) → Apps → **smartclick** → **API credentials** → Regenerate Client secret.
2. Partners → **Settings** → Rotate any exposed tokens.
3. Never share `shpat_`, `shpss_`, or `atkn_` tokens in chat again.

## 2. Fix `Field 'createdAt' doesn't exist on type 'Metaobject'`

**Cause:** GraphQL queried `createdAt` on `Metaobject`. Shopify exposes `updatedAt`; the UI field `createdAt` is mapped from that in app code.

**Fix:** Replace your file:

`app/models/QRCode.server.js`

with the copy in this repo:

`shopify-smartclick/app/models/QRCode.server.js`

Also copy the public scan route (if missing locally):

`shopify-smartclick/app/routes/qrcodes.$id.scan.jsx`

Or run the PowerShell applier (see §9).

Key lines:

- Query uses `updatedAt` (not `createdAt`).
- `transformMetaobject` sets `createdAt: metaobject.updatedAt` for the UI.

## 3. App config (scopes + metaobjects)

Merge into your `shopify.app.smartclick.toml` (keep your real `client_id`):

```toml
[access_scopes]
scopes = "write_metaobject_definitions,write_metaobjects,write_products"
```

If other app features need inventory or location APIs, add those scopes explicitly.

Copy the `[metaobjects.app.qrcode]` block from `shopify-smartclick/shopify.app.smartclick.toml` if missing.

Then:

```powershell
cd C:\Users\Mobar\.gemini\antigravity\scratch\mobarshamhub\mobarshamhub
npm run dev
```

When prompted, allow URL override. In the admin, click **Update app** if scopes changed.

## 4. Create demo products (automated)

With `npm run dev` running:

```powershell
shopify app execute --store smartclick-vliwpke0.myshopify.com --query @scripts/bootstrap-store.graphql
```

Copy `scripts/bootstrap-store.graphql` from this folder into your project `scripts/` folder first, or run from a clone of this repo.

Confirm the mutation succeeded: response should include a `product` with variants and an empty `userErrors` array.

Repeat with different product titles, or create more products in **Admin → Products**.

## 5. Store contact details

Update in **Admin → Settings → General** (not in app code):

| Field | Value |
|-------|--------|
| Store name | smartclick |
| Store email | newmobarsham@gmail.com |
| Store domain (dev) | smartclick-vliwpke0.myshopify.com |

Production store **OneClick Hub** (`jrvm00-gs.myshopify.com`) is separate — install the app there only when you are ready to sell live.

## 6. Dev store vs selling for real

| Store | Domain | Use |
|-------|--------|-----|
| Dev | smartclick-vliwpke0.myshopify.com | Build & test app + QR codes |
| Production | jrvm00-gs.myshopify.com | Real sales (needs payments, shipping, legal) |

To sell on production:

1. **Settings → Payments** — enable Shopify Payments or a provider.
2. **Settings → Shipping** — add rates.
3. Install **smartclick** on the production store (Partners → Test on store).
4. Deploy app: `npm run deploy` (after dev works).

## 7. Verify QR flow

1. Open app (press `p` in dev terminal).
2. **Create QR Code** → pick a product → save.
3. Scan QR → product or cart opens.
4. Scan count increments in the app list.

If a QR shows **Destination unavailable** in the list (`destinationBroken: true`), re-save it with a valid product and variant. See `patches/app._index.destinationBroken.snippet.jsx`.

See `SCAN_ROUTE_CHECKLIST.md` after copying files into mobarshamhub.

## 8. One-command copy (Windows / Linux)

From a clone of this repo:

```powershell
cd path\to\english-explorer-kids\shopify-smartclick
.\scripts\apply-to-mobarshamhub.ps1
# or: .\scripts\apply-to-mobarshamhub.ps1 -TargetRoot "D:\your\mobarshamhub"
```

```bash
cd path/to/english-explorer-kids/shopify-smartclick
chmod +x scripts/apply-to-mobarshamhub.sh
./scripts/apply-to-mobarshamhub.sh /path/to/mobarshamhub
```

Then merge scopes/metaobjects from `shopify.app.smartclick.toml.smartclick-pack` into your real TOML (keep `client_id`).

## 9. Shopify AI Toolkit (agent skills)

Curated skills for Cursor/agents live in `shopify-smartclick/ai-toolkit/`. See `ai-toolkit/README.md`.

For full MCP + docs search, install the [Shopify plugin from Cursor Marketplace](https://cursor.com/marketplace/shopify).

## 10. Push your app to GitHub (recommended)

So cloud agents can edit the real codebase:

```powershell
cd C:\Users\Mobar\.gemini\antigravity\scratch\mobarshamhub\mobarshamhub
git init
git remote add origin https://github.com/amjad2161/smartclick-app.git
git add .
git commit -m "SmartClick QR app"
git push -u origin main
```

---

Based on [Shopify example QR app](https://github.com/Shopify/example-app--qr-code--remix).
