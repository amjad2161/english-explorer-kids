import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  generateHandle,
  getDestinationUrl,
  validateQRCode,
} from "../app/models/QRCode.server.js";

describe("validateQRCode", () => {
  it("requires title, product, and destination", () => {
    const errors = validateQRCode({});
    assert.equal(errors.title, "Title is required");
    assert.equal(errors.productId, "Product is required");
    assert.equal(errors.destination, "Destination is required");
  });

  it("requires variant for cart destination", () => {
    const errors = validateQRCode({
      title: "Summer promo",
      productId: "gid://shopify/Product/1",
      destination: "cart",
    });
    assert.equal(
      errors.productVariantId,
      "Product variant is required for cart destination",
    );
  });

  it("accepts valid product destination", () => {
    assert.equal(
      validateQRCode({
        title: "Shelf tag",
        productId: "gid://shopify/Product/1",
        productVariantId: "gid://shopify/ProductVariant/1",
        destination: "product",
      }),
      undefined,
    );
  });
});

describe("generateHandle", () => {
  it("slugifies title and appends a unique suffix", () => {
    const handle = generateHandle("Hello World!");
    assert.match(handle, /^hello-world-[a-z0-9]+$/);
  });
});

describe("getDestinationUrl", () => {
  const shop = "smartclick-vliwpke0.myshopify.com";

  it("builds product URL with variant", () => {
    const url = getDestinationUrl(
      {
        destination: "product",
        productHandle: "demo-hoodie",
        productVariantLegacyId: "12345",
      },
      shop,
    );
    assert.equal(
      url,
      "https://smartclick-vliwpke0.myshopify.com/products/demo-hoodie?variant=12345",
    );
  });

  it("builds cart URL", () => {
    const url = getDestinationUrl(
      {
        destination: "cart",
        productVariantLegacyId: "12345",
      },
      shop,
    );
    assert.equal(
      url,
      "https://smartclick-vliwpke0.myshopify.com/cart/12345:1",
    );
  });

  it("throws when cart destination lacks variant", () => {
    assert.throws(
      () =>
        getDestinationUrl(
          { destination: "cart", productVariantLegacyId: null },
          shop,
        ),
      /Unrecognised product variant ID/,
    );
  });
});
