import { describe, expect, it } from "vitest";

import { getProductsEmptyState } from "./empty-state";
import type { ProductListQuery, ProductListResult } from "./types";

function query(overrides: Partial<ProductListQuery> = {}): ProductListQuery {
  return { q: "", category: null, page: 1, sort: null, ...overrides };
}

function listing(overrides: Partial<ProductListResult> = {}): ProductListResult {
  return {
    items: [],
    totalItems: 0,
    page: 1,
    pageSize: 12,
    totalPages: 0,
    ...overrides,
  };
}

describe("getProductsEmptyState", () => {
  it("returns null when there are results within range", () => {
    expect(
      getProductsEmptyState(
        query(),
        listing({ totalItems: 5, totalPages: 1 })
      )
    ).toBeNull();
  });

  it("shows the no-products-at-all message when nothing is filtered and the store is empty", () => {
    const state = getProductsEmptyState(query(), listing());
    expect(state?.message).toBe("ยังไม่มีสินค้าในระบบ");
  });

  it("shows the search-only empty message", () => {
    const state = getProductsEmptyState(query({ q: "brew" }), listing());
    expect(state?.message).toBe("ไม่พบสินค้าที่ตรงกับคำค้นหา");
  });

  it("shows the category-only empty message", () => {
    const state = getProductsEmptyState(query({ category: 3 }), listing());
    expect(state?.message).toBe("ไม่พบสินค้าในหมวดหมู่นี้");
  });

  it("shows the combined search+category empty message", () => {
    const state = getProductsEmptyState(
      query({ q: "brew", category: 3 }),
      listing()
    );
    expect(state?.message).toBe("ไม่พบสินค้าตามเงื่อนไขที่เลือก");
  });

  it("shows the page-out-of-range message when results exist but the page is beyond totalPages", () => {
    const state = getProductsEmptyState(
      query({ page: 5 }),
      listing({ totalItems: 5, totalPages: 1 })
    );
    expect(state?.message).toBe("ไม่พบสินค้าในหน้านี้");
    expect(state?.actionHref).toBe("/products");
  });

  it("preserves filters in the out-of-range recovery link", () => {
    const state = getProductsEmptyState(
      query({ page: 5, q: "brew", category: 3 }),
      listing({ totalItems: 5, totalPages: 1 })
    );
    expect(state?.actionHref).toBe("/products?q=brew&category=3");
  });
});
