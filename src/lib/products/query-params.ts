import type { ProductListQuery, ProductSort } from "./types";

const MAX_QUERY_LENGTH = 100;
const SORT_VALUES = new Set<ProductSort>(["price_asc", "price_desc"]);

export type RawProductSearchParams = Record<
  string,
  string | string[] | undefined
>;

function firstValue(
  value: string | string[] | undefined
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parsePositiveInt(raw: string | undefined): number | null {
  if (!raw || !/^[1-9]\d*$/.test(raw)) return null;
  return Number(raw);
}

export function parseProductListQuery(
  searchParams: RawProductSearchParams
): ProductListQuery {
  const q = (firstValue(searchParams.q) ?? "").trim().slice(0, MAX_QUERY_LENGTH);
  const category = parsePositiveInt(firstValue(searchParams.category));
  const page = parsePositiveInt(firstValue(searchParams.page)) ?? 1;

  const rawSort = firstValue(searchParams.sort);
  const sort = SORT_VALUES.has(rawSort as ProductSort)
    ? (rawSort as ProductSort)
    : null;

  return { q, category, page, sort };
}

export function buildProductListSearchParams(
  query: Partial<ProductListQuery>
): URLSearchParams {
  const params = new URLSearchParams();

  if (query.q) params.set("q", query.q);
  if (query.category) params.set("category", String(query.category));
  if (query.sort) params.set("sort", query.sort);
  if (query.page && query.page > 1) params.set("page", String(query.page));

  return params;
}

export function buildProductsHref(query: Partial<ProductListQuery>): string {
  const qs = buildProductListSearchParams(query).toString();
  return qs ? `/products?${qs}` : "/products";
}
