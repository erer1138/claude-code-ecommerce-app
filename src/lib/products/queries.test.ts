import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSupabaseClient } from "@/lib/supabase/client";
import { getCategories, getProductDetail, getProductListing } from "./queries";

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseClient: vi.fn(),
}));

type MockResult = {
  data: unknown;
  error: { message: string; code?: string } | null;
  count?: number;
};

function createBuilder(result: MockResult) {
  const builder: Record<string, unknown> = {};
  const chain = () => builder;

  builder.select = vi.fn(chain);
  builder.eq = vi.fn(chain);
  builder.ilike = vi.fn(chain);
  builder.order = vi.fn(chain);
  builder.limit = vi.fn(chain);
  builder.range = vi.fn(() => Promise.resolve(result));
  builder.maybeSingle = vi.fn(() => Promise.resolve(result));
  builder.then = (resolve: (value: MockResult) => void) => resolve(result);

  return builder;
}

function mockFrom(result: MockResult) {
  const builder = createBuilder(result);
  const from = vi.fn(() => builder);
  vi.mocked(getSupabaseClient).mockReturnValue({ from } as never);
  return { builder, from };
}

function mockFromSequence(results: MockResult[]) {
  const builders = results.map(createBuilder);
  const from = vi.fn();
  results.forEach((_, i) => from.mockImplementationOnce(() => builders[i]));
  vi.mocked(getSupabaseClient).mockReturnValue({ from } as never);
  return { builders, from };
}

beforeEach(() => {
  vi.mocked(getSupabaseClient).mockReset();
});

describe("getCategories", () => {
  it("returns the mapped category list", async () => {
    mockFrom({
      data: [
        { id: 1, name: "สมาร์ทโฟน" },
        { id: 2, name: "แล็ปท็อป" },
      ],
      error: null,
    });

    await expect(getCategories()).resolves.toEqual([
      { id: 1, name: "สมาร์ทโฟน" },
      { id: 2, name: "แล็ปท็อป" },
    ]);
  });

  it("throws a generic error (no leaked DB details) when the query fails", async () => {
    mockFrom({ data: null, error: { message: "relation does not exist" } });

    await expect(getCategories()).rejects.toThrow("Unable to load categories");
  });
});

describe("getProductListing", () => {
  it("maps rows and derives the main image from the embedded product_images array", async () => {
    mockFrom({
      data: [
        {
          id: 2,
          name: "iPhone 16 Pro",
          price: "45900",
          product_images: [{ image_name: "products/2/front.jpg", created_at: null }],
        },
        { id: 5, name: "iPad Air M2", price: "33900", product_images: [] },
      ],
      error: null,
      count: 5,
    });

    const result = await getProductListing({ q: "", category: null, page: 1, sort: null });

    expect(result.items).toEqual([
      { id: 2, name: "iPhone 16 Pro", price: "45900", mainImageName: "products/2/front.jpg" },
      { id: 5, name: "iPad Air M2", price: "33900", mainImageName: null },
    ]);
    expect(result.totalItems).toBe(5);
    expect(result.totalPages).toBe(1);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(12);
  });

  it("requests the correct LIMIT/OFFSET range for page 2", async () => {
    const { builder } = mockFrom({ data: [], error: null, count: 0 });

    await getProductListing({ q: "", category: null, page: 2, sort: null });

    expect(builder.range).toHaveBeenCalledWith(12, 23);
  });

  it("applies category and search filters together", async () => {
    const { builder } = mockFrom({ data: [], error: null, count: 0 });

    await getProductListing({ q: "coffee", category: 3, page: 1, sort: null });

    expect(builder.eq).toHaveBeenCalledWith("category_id", 3);
    expect(builder.ilike).toHaveBeenCalledWith("name", "%coffee%");
  });

  it("orders by price with a deterministic id secondary order for price_asc", async () => {
    const { builder } = mockFrom({ data: [], error: null, count: 0 });

    await getProductListing({ q: "", category: null, page: 1, sort: "price_asc" });

    expect(builder.order).toHaveBeenCalledWith("price", { ascending: true });
    expect(builder.order).toHaveBeenCalledWith("id", { ascending: true });
  });

  it("orders by price descending for price_desc", async () => {
    const { builder } = mockFrom({ data: [], error: null, count: 0 });

    await getProductListing({ q: "", category: null, page: 1, sort: "price_desc" });

    expect(builder.order).toHaveBeenCalledWith("price", { ascending: false });
  });

  it("returns totalPages 0 when there are no matching items", async () => {
    mockFrom({ data: [], error: null, count: 0 });

    const result = await getProductListing({ q: "nonsense", category: null, page: 1, sort: null });

    expect(result.totalPages).toBe(0);
    expect(result.items).toEqual([]);
  });

  it("throws a generic error when the query fails", async () => {
    mockFrom({ data: null, error: { message: "password authentication failed" } });

    await expect(
      getProductListing({ q: "", category: null, page: 1, sort: null })
    ).rejects.toThrow("Unable to load products");
  });

  it("treats an out-of-range page (PGRST103) as an empty page instead of throwing", async () => {
    const { builders } = mockFromSequence([
      {
        data: null,
        error: {
          code: "PGRST103",
          message: "Requested range not satisfiable",
        },
      },
      { data: null, error: null, count: 5 },
    ]);

    const result = await getProductListing({
      q: "",
      category: null,
      page: 5,
      sort: null,
    });

    expect(result.items).toEqual([]);
    expect(result.totalItems).toBe(5);
    expect(result.totalPages).toBe(1);
    expect(builders[1].select).toHaveBeenCalledWith("id", {
      count: "exact",
      head: true,
    });
  });

  it("reapplies category/search filters on the PGRST103 count-only fallback", async () => {
    const { builders } = mockFromSequence([
      {
        data: null,
        error: {
          code: "PGRST103",
          message: "Requested range not satisfiable",
        },
      },
      { data: null, error: null, count: 0 },
    ]);

    await getProductListing({ q: "coffee", category: 3, page: 9, sort: null });

    expect(builders[1].eq).toHaveBeenCalledWith("category_id", 3);
    expect(builders[1].ilike).toHaveBeenCalledWith("name", "%coffee%");
  });
});

describe("getProductDetail", () => {
  it("returns null when no product matches the id", async () => {
    mockFrom({ data: null, error: null });

    await expect(getProductDetail(999)).resolves.toBeNull();
  });

  it("maps category and images (including a product with multiple images)", async () => {
    mockFrom({
      data: {
        id: 2,
        name: "iPhone 16 Pro",
        description: "สมาร์ทโฟน Apple",
        price: "45900",
        categories: { id: 1, name: "สมาร์ทโฟน" },
        product_images: [
          { id: 2, image_name: "products/2/back.jpg", created_at: "2026-07-21T16:26:27Z" },
          { id: 3, image_name: "products/2/front.jpg", created_at: "2026-07-21T16:26:27Z" },
        ],
      },
      error: null,
    });

    const detail = await getProductDetail(2);

    expect(detail).toEqual({
      id: 2,
      name: "iPhone 16 Pro",
      description: "สมาร์ทโฟน Apple",
      price: "45900",
      category: { id: 1, name: "สมาร์ทโฟน" },
      images: [
        { id: 2, imageName: "products/2/back.jpg", createdAt: "2026-07-21T16:26:27Z" },
        { id: 3, imageName: "products/2/front.jpg", createdAt: "2026-07-21T16:26:27Z" },
      ],
    });
  });

  it("handles a product with no category and no images without throwing", async () => {
    mockFrom({
      data: {
        id: 5,
        name: "iPad Air M2",
        description: null,
        price: "33900",
        categories: null,
        product_images: [],
      },
      error: null,
    });

    await expect(getProductDetail(5)).resolves.toEqual({
      id: 5,
      name: "iPad Air M2",
      description: null,
      price: "33900",
      category: null,
      images: [],
    });
  });

  it("throws a generic error when the query fails", async () => {
    mockFrom({ data: null, error: { message: "connection refused" } });

    await expect(getProductDetail(2)).rejects.toThrow("Unable to load product");
  });
});
