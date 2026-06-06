# OneClick Hub store readiness

Production store: **https://mobarsham.myshopify.com/**  
Brand: **OneClick Hub**  
WordPress: **https://mobarshamcom.wordpress.com/**

## Current public status (automated audit)

Run anytime (no Admin token):

```powershell
cd shopify-smartclick\scripts
python audit-store-public.py mobarsham.myshopify.com
```

Last cloud scan found:

| Check | Status |
|-------|--------|
| Storefront live (HTTP 200) | OK |
| Published products | 28 |
| Available variants | 117 |
| Collections | 2 |
| Privacy policy | OK |
| Refund policy | Missing |
| Shipping policy | Missing |
| Terms of service | Missing |
| Contact page | OK |

Common warnings: sample products with no description, some out-of-stock variants, one zero-price product ("Some").

## Readiness score target

- **85+** with zero failures: soft launch OK (still verify payments/shipping manually)
- **60-84**: fix policies, inventory, and content before ads
- **Below 60**: not ready for customers

## What runs automatically (Windows)

### Dev store (SmartClick QR app)

```powershell
cd shopify-smartclick\scripts
.\run-from-zero.ps1
```

Store: `smartclick-vliwpke0.myshopify.com`

### Production store (OneClick Hub)

```powershell
cd shopify-smartclick\scripts
.\run-from-zero.ps1 -Store mobarsham.myshopify.com
# or full production pipeline:
.\setup-production.ps1
```

Audit only:

```powershell
.\setup-production.ps1 -AuditOnly
```

## Admin API access (required for full automation)

Partners **Client ID + Secret** and **refresh tokens** are not Admin API tokens. To let scripts create products, policies, and menus remotely you need either:

1. **Custom app** on the store: Settings > Apps > Develop apps > Create app > Configure Admin API scopes > Install > copy `shpat_...` once into local `.env` (never commit), or
2. **`shopify app execute`** with `npm run dev` logged into the store where **OneClick Hub** is installed.

Collaborator code **6256** only lets a partner request access; it does not grant API access by itself.

## Manual steps you still must do in Admin

1. **Settings > General** - confirm store name, email, address (see your mobile screenshots)
2. **Settings > Payments** - connect Shopify Payments or another provider
3. **Settings > Shipping and delivery** - zones and rates for Israel
4. **Settings > Policies** - run `bootstrap-policies.graphql` or paste legal text
5. **Products** - fix zero price / out-of-stock demo items; add SEO titles
6. **Online Store > Navigation** - main menu and footer links
7. **Apps > OneClick Hub** - install and click **Update app** after scope changes
8. **Canva Connect** - optional; use authorization code from Admin app page

## Security

Credentials pasted in chat should be **rotated** in Partners and Admin. Never commit tokens to git. Use `.env.example` as a template locally.

## Deploy app to production

After dev works on the dev store:

```powershell
cd C:\Users\Mobar\.gemini\antigravity\scratch\mobarshamhub\mobarshamhub
npm run deploy
```

Then install **OneClick Hub** on `mobarsham.myshopify.com` from Partners.
