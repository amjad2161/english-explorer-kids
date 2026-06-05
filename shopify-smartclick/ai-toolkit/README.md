# Shopify AI Toolkit (curated for SmartClick)

The full [Shopify AI Toolkit](https://github.com/Shopify/Shopify-AI-Toolkit) is an agent plugin (~27k files). This folder keeps **only the skills relevant to smartclick** so agents and developers do not need to clone the entire repo.

## Install the full plugin (recommended for Cursor)

1. [Cursor Marketplace — Shopify](https://cursor.com/marketplace/shopify), or
2. Clone: `git clone https://github.com/Shopify/Shopify-AI-Toolkit.git`

That gives live MCP tools (docs search, Admin GraphQL validation, CLI helpers).

## Skills included here (offline copy)

| File | Use for smartclick |
|------|-------------------|
| `skills/shopify-custom-data.md` | Metaobjects, metafields, `$app:qrcode` patterns |
| `skills/shopify-admin.md` | Admin GraphQL for products, metaobjects, mutations |
| `skills/shopify-polaris-app-home.md` | Embedded admin UI (QR list, forms, Polaris web components) |
| `skills/shopify-use-shopify-cli.md` | `shopify app dev`, `app execute`, deploy, store auth |
| `skills/shopify-app-store-review.md` | Pre-submission checklist before App Store |

Source commit: shallow clone of `Shopify/Shopify-AI-Toolkit` main branch at import time. For updates, re-copy `SKILL.md` from upstream or install the marketplace plugin.

## When to use which skill

| Task | Skill |
|------|--------|
| Fix QR metaobject / GraphQL | `shopify-custom-data`, `shopify-admin` |
| Admin home UI changes | `shopify-polaris-app-home` |
| Bootstrap product, dev store CLI | `shopify-use-shopify-cli` |
| Prepare for production listing | `shopify-app-store-review` |

## Not copied (not needed for this app)

Hydrogen, Liquid themes, checkout extensions, POS, UCP, payments apps — omit unless smartclick grows beyond embedded Admin QR tooling.
