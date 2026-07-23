import { describe, expect, it } from "vitest";

import { PRODUCT_IMAGE_PLACEHOLDER_URL, resolveProductImageUrl } from "./image";

describe("resolveProductImageUrl", () => {
  it("returns the local placeholder when imageName is null", () => {
    expect(resolveProductImageUrl(null)).toBe(PRODUCT_IMAGE_PLACEHOLDER_URL);
  });

  it("resolves a storage-style path to its local public/product-image basename", () => {
    expect(resolveProductImageUrl("products/2/iphone16pro-front.jpg")).toBe(
      "/product-image/iphone16pro-front.jpg"
    );
  });

  it("resolves a bare filename (no directory prefix) unchanged", () => {
    expect(resolveProductImageUrl("galaxy-s25-front.jpg")).toBe(
      "/product-image/galaxy-s25-front.jpg"
    );
  });
});
