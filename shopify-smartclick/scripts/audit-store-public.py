#!/usr/bin/env python3
"""Public storefront readiness audit (no Admin API token required)."""

from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass, field


@dataclass
class Finding:
    severity: str  # ok | warn | fail
    code: str
    message: str


@dataclass
class AuditReport:
    store: str
    findings: list[Finding] = field(default_factory=list)

    def add(self, severity: str, code: str, message: str) -> None:
        self.findings.append(Finding(severity, code, message))

    def score(self) -> int:
        weights = {"fail": -15, "warn": -5, "ok": 0}
        base = 100
        for f in self.findings:
            base += weights.get(f.severity, 0)
        return max(0, min(100, base))


def fetch_json(url: str) -> dict | list | None:
    req = urllib.request.Request(url, headers={"User-Agent": "SmartClick-Audit/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return json.loads(resp.read().decode())
    except (urllib.error.HTTPError, urllib.error.URLError, json.JSONDecodeError):
        return None


def head_status(base: str, path: str) -> int | None:
    req = urllib.request.Request(base + path, method="HEAD", headers={"User-Agent": "SmartClick-Audit/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status
    except urllib.error.HTTPError as e:
        return e.code
    except urllib.error.URLError:
        return None


def audit(store: str) -> AuditReport:
    base = store if store.startswith("http") else f"https://{store}"
    base = base.rstrip("/")
    report = AuditReport(store=base.replace("https://", "").replace("http://", ""))

    home = head_status(base, "/")
    if home == 200:
        report.add("ok", "STOREFRONT_LIVE", "Storefront responds HTTP 200")
    else:
        report.add("fail", "STOREFRONT_DOWN", f"Homepage status: {home}")

    products_payload = fetch_json(f"{base}/products.json?limit=250")
    if not isinstance(products_payload, dict):
        report.add("fail", "PRODUCTS_JSON", "Could not read /products.json")
        products = []
    else:
        products = products_payload.get("products") or []

    if len(products) == 0:
        report.add("fail", "NO_PRODUCTS", "No published products on storefront")
    else:
        report.add("ok", "PRODUCT_COUNT", f"{len(products)} published product(s)")

    available = 0
    zero_price = 0
    missing_desc = 0
    for p in products:
        if not (p.get("body_html") or "").strip():
            missing_desc += 1
        for v in p.get("variants") or []:
            if v.get("available"):
                available += 1
            try:
                if float(v.get("price") or 0) <= 0:
                    zero_price += 1
            except (TypeError, ValueError):
                zero_price += 1

    if available == 0:
        report.add("fail", "NO_INVENTORY", "No variants marked available for sale")
    elif available < len(products):
        report.add("warn", "PARTIAL_INVENTORY", f"{available} available variant(s); some are out of stock")
    else:
        report.add("ok", "INVENTORY", f"{available} available variant(s)")

    if zero_price:
        report.add("warn", "ZERO_PRICE", f"{zero_price} variant(s) priced at 0")

    if missing_desc:
        report.add("warn", "MISSING_DESCRIPTIONS", f"{missing_desc} product(s) without description HTML")

    collections_payload = fetch_json(f"{base}/collections.json")
    collections = (collections_payload or {}).get("collections") if isinstance(collections_payload, dict) else []
    if not collections:
        report.add("warn", "NO_COLLECTIONS", "No public collections")
    else:
        report.add("ok", "COLLECTIONS", f"{len(collections)} collection(s)")

    for path in ("/cart", "/collections/all"):
        status = head_status(base, path)
        if status == 200:
            report.add("ok", f"PATH_{path.replace('/', '_')}", f"{path} OK")
        else:
            report.add("warn", f"PATH_{path.replace('/', '_')}", f"{path} status {status}")

    policies = [
        ("privacy-policy", "/policies/privacy-policy"),
        ("refund-policy", "/policies/refund-policy"),
        ("shipping-policy", "/policies/shipping-policy"),
        ("terms-of-service", "/policies/terms-of-service"),
    ]
    for name, path in policies:
        status = head_status(base, path)
        if status == 200:
            report.add("ok", f"POLICY_{name.upper().replace('-', '_')}", f"{name} published")
        else:
            report.add("warn" if name == "privacy-policy" else "fail", f"POLICY_{name.upper().replace('-', '_')}", f"{name} missing (HTTP {status})")

    contact = head_status(base, "/pages/contact")
    if contact == 200:
        report.add("ok", "PAGE_CONTACT", "Contact page exists")
    else:
        report.add("warn", "PAGE_CONTACT", f"Contact page status {contact}")

    return report


def print_report(report: AuditReport) -> int:
    icons = {"ok": "[OK]", "warn": "[!!]", "fail": "[XX]"}
    print(f"\nStore readiness audit: {report.store}")
    print("=" * 60)
    for f in report.findings:
        print(f"  {icons.get(f.severity, '[??]')} {f.code}: {f.message}")
    score = report.score()
    print("=" * 60)
    print(f"Readiness score: {score}/100")
    fails = sum(1 for f in report.findings if f.severity == "fail")
    warns = sum(1 for f in report.findings if f.severity == "warn")
    print(f"Failures: {fails}  Warnings: {warns}")
    if score >= 85 and fails == 0:
        print("Verdict: READY for soft launch (verify payments/shipping in Admin)")
    elif score >= 60:
        print("Verdict: NEEDS WORK before marketing the store")
    else:
        print("Verdict: NOT READY - fix failures first")
    return 1 if fails else 0


def main() -> None:
    store = sys.argv[1] if len(sys.argv) > 1 else "mobarsham.myshopify.com"
    report = audit(store)
    raise SystemExit(print_report(report))


if __name__ == "__main__":
    main()
