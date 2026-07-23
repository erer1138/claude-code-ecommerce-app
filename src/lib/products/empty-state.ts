import { buildProductsHref } from "./query-params";
import type { ProductListQuery, ProductListResult } from "./types";

export type ProductsEmptyState = {
  message: string;
  actionHref: string;
  actionLabel: string;
};

export function getProductsEmptyState(
  query: ProductListQuery,
  listing: ProductListResult
): ProductsEmptyState | null {
  const hasSearch = query.q.length > 0;
  const hasCategory = query.category !== null;

  if (listing.totalItems === 0) {
    if (hasSearch && hasCategory) {
      return {
        message: "ไม่พบสินค้าตามเงื่อนไขที่เลือก",
        actionHref: "/products",
        actionLabel: "ล้างตัวกรองทั้งหมด",
      };
    }

    if (hasSearch) {
      return {
        message: "ไม่พบสินค้าที่ตรงกับคำค้นหา",
        actionHref: buildProductsHref({
          category: query.category,
          sort: query.sort,
        }),
        actionLabel: "ล้างคำค้นหา",
      };
    }

    if (hasCategory) {
      return {
        message: "ไม่พบสินค้าในหมวดหมู่นี้",
        actionHref: buildProductsHref({ q: query.q, sort: query.sort }),
        actionLabel: "ดูสินค้าทั้งหมด",
      };
    }

    return {
      message: "ยังไม่มีสินค้าในระบบ",
      actionHref: "/",
      actionLabel: "กลับหน้าหลัก",
    };
  }

  if (query.page > listing.totalPages) {
    return {
      message: "ไม่พบสินค้าในหน้านี้",
      actionHref: buildProductsHref({
        q: query.q,
        category: query.category,
        sort: query.sort,
      }),
      actionLabel: "กลับไปหน้าแรก",
    };
  }

  return null;
}
