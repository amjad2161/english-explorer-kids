# SmartClick — התקנה מאפס ב-Windows

מדריך מלא למחשב של Mobar. כל הפקודות ל-PowerShell.

## מה צריך מראש

| דבר | איפה |
|-----|------|
| Node.js | כבר מותקן (`node -v` → v26+) |
| Shopify CLI | `npm install -g @shopify/cli@latest` |
| אפליקציית Remix | `C:\Users\Mobar\.gemini\antigravity\scratch\mobarshamhub\mobarshamhub` |
| חנות dev | `smartclick-vliwpke0.myshopify.com` |

---

## שלב 1 — Clone של fix-pack (פעם אחת)

```powershell
cd C:\Users\Mobar
git clone https://github.com/amjad2161/english-explorer-kids.git
cd english-explorer-kids
git checkout cursor/smartclick-setup-8c32
cd shopify-smartclick
```

אם `git` לא מותקן: https://git-scm.com/download/win

---

## שלב 2 — הרצת setup אוטומטי

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
cd C:\Users\Mobar\english-explorer-kids\shopify-smartclick\scripts
.\setup-windows-fresh.ps1
```

הסקריפט:

- בודק Node + Shopify CLI
- מעתיק קבצי תיקון ל-mobarshamhub
- מריץ `npm ci` / `npm install` בפרויקט

---

## שלב 3 — מיזוג TOML (ידני, פעם אחת)

פתח:

- `mobarshamhub\shopify.app.smartclick.toml` (האמיתי)
- `mobarshamhub\shopify.app.smartclick.toml.smartclick-pack` (reference)

העתק מה-pack ל-real **בלי לשנות `client_id`**:

```toml
[access_scopes]
scopes = "write_metaobject_definitions,write_metaobjects,write_products"
```

+ כל הבлок `[metaobjects.app.qrcode]` והשדות שלו.

---

## שלב 4 — חלון A: dev server

```powershell
cd C:\Users\Mobar\.gemini\antigravity\scratch\mobarshamhub\mobarshamhub
npm run dev
```

- התחבר ל-Partners אם נשאל
- לחץ **`p`** לפתיחת האפליקציה
- לחץ **Update app** אם scopes השתנו

**השאר את החלון הזה פתוח.**

---

## שלב 5 — חלון B: מוצר דemo

```powershell
cd C:\Users\Mobar\.gemini\antigravity\scratch\mobarshamhub\mobarshamhub
.\scripts\bootstrap-demo-product.ps1
```

או ידנית (PowerShell — **לא** `@scripts/...`):

```powershell
$q = (Get-Content -Raw .\scripts\bootstrap-store.graphql) -replace '(?m)^\s*#.*\r?\n',''
shopify app execute --store smartclick-vliwpke0.myshopify.com --query $q
```

הצלחה = JSON עם `product` ו-`userErrors: []`.

---

## שלב 6 — בדיקת QR

1. באפליקציה: **Create QR Code** → בחר מוצר → שמור
2. סרוק QR (או פתח את ה-URL מה-devtools)
3. וודא redirect ל-product או cart
4. וודא ש-scans עולה ברשימה

---

## פתרון בעיות

### `shopify` לא מזוהה

```powershell
npm install -g @shopify/cli@latest
$npmBin = "$env:APPDATA\npm"
[Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path","User") + ";$npmBin", "User")
```

סגור PowerShell, פתח מחדש, או השתמש ב-`npx @shopify/cli` במקום `shopify`.

### `Unexpected "@"` ב-app execute

PowerShell לא תומך ב-`--query @file`. השתמש ב-`bootstrap-demo-product.ps1` או ב-`Get-Content -Raw`.

### `english-explorer-kids` לא קיים

```powershell
cd C:\Users\Mobar
git clone https://github.com/amjad2161/english-explorer-kids.git
```

### `createdAt` Metaobject error

הרץ שוב `apply-to-mobarshamhub.ps1` — מחליף את `QRCode.server.js` המתוקן.

---

## קישורים

| | |
|--|--|
| Admin dev | https://smartclick-vliwpke0.myshopify.com/admin |
| Partners | https://partners.shopify.com |
| PR fix-pack | https://github.com/amjad2161/english-explorer-kids/pull/45 |
