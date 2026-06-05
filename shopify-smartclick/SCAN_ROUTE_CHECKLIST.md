# Scan route checklist (mobarshamhub)

After copying `shopify-smartclick/app/models/QRCode.server.js` into your Remix app, verify the **public scan route** — it is not included in this fix pack.

Expected file: `app/routes/qrcodes.$id.scan.jsx`

A hardened copy ships in this fix pack: `shopify-smartclick/app/routes/qrcodes.$id.scan.jsx`

## 1. Route exists and is public

- [ ] Loader handles `GET /qrcodes/:id/scan` without requiring an embedded admin session.
- [ ] Uses `unauthenticated.admin(shop)` (or equivalent) so only installed shops are accepted.

## 2. Required query parameters

- [ ] Rejects requests missing `?shop=` with a clear error (official example uses `invariant(shop, ...)`).
- [ ] Rejects missing `:id` handle.

## 3. Redirect target

- [ ] Loads metaobject by handle type `$app:qrcode`.
- [ ] Increments scan count via `incrementQRCodeScans` **before** redirect.
- [ ] Redirects with `redirect(getDestinationUrl(qrCode, shop))`.

## 4. Shop parameter safety

The QR image embeds `shop` in the scan URL (`getQRCodeImage`). Confirm:

- [ ] `unauthenticated.admin(shop)` fails for shops where the app is not installed.
- [ ] Redirect host is always `https://${shop}/...` where `shop` is the **myshopify.com** domain from the query string.
- [ ] Rejects `shop` values that are not `*.myshopify.com` (included in fix-pack route via `assertMyShopifyDomain`).

## 5. Broken QR data

With hardened `QRCode.server.js`, the admin list may show `destinationBroken: true` when product/variant data is missing. The scan route should still use `getDestinationUrl`, which throws if cart destination lacks a variant — confirm the route returns **404** or a friendly error instead of a 500.

## 6. Manual test

1. Create a QR in the app (product + cart destinations).
2. Open the scan URL from the generated QR (or copy link from devtools).
3. Confirm redirect to storefront product or cart.
4. Confirm scan count increases in the app list.
5. Delete the linked variant (cart QR) and confirm list still loads; scan route behaves predictably.

Reference implementation: [Shopify example — qrcodes.$id.scan.jsx](https://github.com/Shopify/example-app--qr-code--remix/blob/main/app/routes/qrcodes.$id.scan.jsx)
