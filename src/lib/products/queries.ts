import { cache } from "react";

import { getSupabaseClient } from "@/lib/supabase/client";
import { PRODUCTS_PAGE_SIZE } from "./types";
import type {
  ProductCategory,
  ProductDetail,
  ProductListItem,
  ProductListQuery,
  ProductListResult,
} from "./types";

export async function getCategories(): Promise<ProductCategory[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("id", { ascending: true });

  if (error) {
    console.error("[products] getCategories failed:", error.message);
    throw new Error("Unable to load categories");
  }

  return (data ?? []) as ProductCategory[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyProductFilters(builder: any, query: ProductListQuery) {
  let next = builder;
  if (query.category) next = next.eq("category_id", query.category);
  if (query.q) next = next.ilike("name", `%${query.q}%`);
  return next;
}

async function countFilteredProducts(
  query: ProductListQuery
): Promise<number> {
  const supabase = getSupabaseClient();
  let builder = supabase
    .from("products")
    .select("id", { count: "exact", head: true });
  builder = applyProductFilters(builder, query);

  const { count, error } = await builder;

  if (error) {
    console.error("[products] countFilteredProducts failed:", {
      message: error.message,
      query,
    });
    throw new Error("Unable to load products");
  }

  return count ?? 0;
}

export async function getProductListing(
  query: ProductListQuery
): Promise<ProductListResult> {
  const supabase = getSupabaseClient();
  const from = (query.page - 1) * PRODUCTS_PAGE_SIZE;
  const to = from + PRODUCTS_PAGE_SIZE - 1;

  let builder = supabase
    .from("products")
    .select(
      "id, name, price, product_images(image_name, created_at)",
      { count: "exact" }
    )
    .order("created_at", {
      referencedTable: "product_images",
      ascending: true,
      nullsFirst: false,
    })
    .order("id", { referencedTable: "product_images", ascending: true })
    .limit(1, { referencedTable: "product_images" });

  builder = applyProductFilters(builder, query);

  if (query.sort === "price_asc") {
    builder = builder
      .order("price", { ascending: true })
      .order("id", { ascending: true });
  } else if (query.sort === "price_desc") {
    builder = builder
      .order("price", { ascending: false })
      .order("id", { ascending: true });
  } else {
    builder = builder.order("id", { ascending: true });
  }

  const { data, error, count } = await builder.range(from, to);

  if (error) {
    // PGRST103: the requested page's offset is beyond the last row for this
    // filter set. That's a legitimate "page out of range" case (FR-05/FR-08),
    // not a database failure — fall back to a count-only query so the page
    // can render the correct empty state instead of throwing.
    if (error.code === "PGRST103") {
      const totalItems = await countFilteredProducts(query);
      const totalPages =
        totalItems === 0 ? 0 : Math.ceil(totalItems / PRODUCTS_PAGE_SIZE);

      return {
        items: [],
        totalItems,
        page: query.page,
        pageSize: PRODUCTS_PAGE_SIZE,
        totalPages,
      };
    }

    console.error("[products] getProductListing failed:", {
      message: error.message,
      query,
    });
    throw new Error("Unable to load products");
  }

  const rows = (data ?? []) as Array<{
    id: number;
    name: string;
    price: string | number;
    product_images: Array<{ image_name: string; created_at: string | null }>;
  }>;

  const items: ProductListItem[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    price: row.price,
    mainImageName: row.product_images?.[0]?.image_name ?? null,
  }));

  const totalItems = count ?? 0;
  const totalPages =
    totalItems === 0 ? 0 : Math.ceil(totalItems / PRODUCTS_PAGE_SIZE);

  return {
    items,
    totalItems,
    page: query.page,
    pageSize: PRODUCTS_PAGE_SIZE,
    totalPages,
  };
}

export const getProductDetail = cache(async function getProductDetail(
  id: number
): Promise<ProductDetail | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, description, price, categories(id, name), product_images(id, image_name, created_at)"
    )
    .eq("id", id)
    .order("created_at", {
      referencedTable: "product_images",
      ascending: true,
      nullsFirst: false,
    })
    .order("id", { referencedTable: "product_images", ascending: true })
    .maybeSingle();

  if (error) {
    console.error("[products] getProductDetail failed:", {
      message: error.message,
      id,
    });
    throw new Error("Unable to load product");
  }

  if (!data) return null;

  const row = data as unknown as {
    id: number;
    name: string;
    description: string | null;
    price: string | number;
    categories: { id: number; name: string } | null;
    product_images: Array<{
      id: number;
      image_name: string;
      created_at: string | null;
    }>;
  };

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.categories
      ? { id: row.categories.id, name: row.categories.name }
      : null,
    images: (row.product_images ?? []).map((image) => ({
      id: image.id,
      imageName: image.image_name,
      createdAt: image.created_at,
    })),
  };
});
