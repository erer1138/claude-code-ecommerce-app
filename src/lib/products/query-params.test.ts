import { describe, expect, it } from "vitest";

import {
  buildProductListSearchParams,
  buildProductsHref,
  parsePositiveInt,
  parseProductListQuery,
} from "./query-params";

describe("parseProductListQuery", () => {
  it("returns defaults for an empty search params object", () => {
    expect(parseProductListQuery({})).toEqual({
      q: "",
      category: null,
      page: 1,
      sort: null,
    });
  });

  it("trims whitespace from q and caps it at 100 characters", () => {
    expect(parseProductListQuery({ q: "  brew  " }).q).toBe("brew");
    expect(parseProductListQuery({ q: "a".repeat(150) }).q).toHaveLength(100);
  });

  it("parses a valid positive integer category", () => {
    expect(parseProductListQuery({ category: "3" }).category).toBe(3);
  });

  it.each(["0", "-1", "abc", "3.5", ""])(
    "normalizes invalid category %j to null",
    (raw) => {
      expect(parseProductListQuery({ category: raw }).category).toBeNull();
    }
  );

  it("parses a valid positive integer page", () => {
    expect(parseProductListQuery({ page: "2" }).page).toBe(2);
  });

  it.each(["0", "-2", "abc", "", "1.5"])(
    "normalizes invalid page %j to 1",
    (raw) => {
      expect(parseProductListQuery({ page: raw }).page).toBe(1);
    }
  );

  it("allowlists sort to price_asc/price_desc, everything else becomes null", () => {
    expect(parseProductListQuery({ sort: "price_asc" }).sort).toBe(
      "price_asc"
    );
    expect(parseProductListQuery({ sort: "price_desc" }).sort).toBe(
      "price_desc"
    );
    expect(parseProductListQuery({ sort: "name_asc" }).sort).toBeNull();
    expect(parseProductListQuery({ sort: "" }).sort).toBeNull();
  });

  it("takes the first value when a param is duplicated (array)", () => {
    expect(parseProductListQuery({ q: ["first", "second"] }).q).toBe("first");
  });

  it("never throws on malformed input", () => {
    expect(() =>
      parseProductListQuery({
        q: undefined,
        category: "not-a-number",
        page: "-5",
        sort: "invalid",
      })
    ).not.toThrow();
  });
});

describe("parsePositiveInt", () => {
  it("accepts strictly positive integer strings", () => {
    expect(parsePositiveInt("1")).toBe(1);
    expect(parsePositiveInt("42")).toBe(42);
  });

  it.each([undefined, "", "0", "-1", "3.5", "3abc", "abc"])(
    "rejects %j",
    (raw) => {
      expect(parsePositiveInt(raw)).toBeNull();
    }
  );
});

describe("buildProductListSearchParams", () => {
  it("omits default values", () => {
    const params = buildProductListSearchParams({
      q: "",
      category: null,
      page: 1,
      sort: null,
    });
    expect(params.toString()).toBe("");
  });

  it("includes only the provided non-default fields", () => {
    const params = buildProductListSearchParams({
      q: "coffee",
      category: 3,
      page: 2,
      sort: "price_asc",
    });
    expect(params.get("q")).toBe("coffee");
    expect(params.get("category")).toBe("3");
    expect(params.get("page")).toBe("2");
    expect(params.get("sort")).toBe("price_asc");
  });

  it("drops category when set to null (clearing the filter)", () => {
    const params = buildProductListSearchParams({ q: "coffee", category: null });
    expect(params.has("category")).toBe(false);
    expect(params.get("q")).toBe("coffee");
  });
});

describe("buildProductsHref", () => {
  it("returns the bare /products path when there is no query state", () => {
    expect(buildProductsHref({})).toBe("/products");
  });

  it("returns /products with a query string when state is present", () => {
    expect(buildProductsHref({ category: 3 })).toBe("/products?category=3");
  });
});
