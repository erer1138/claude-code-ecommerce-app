import type { Metadata } from "next";

import { Reveal } from "@/components/reveal";
import { ProductCard } from "@/components/products/product-card";
import { CategoryFilter } from "@/components/products/category-filter";
import { SearchForm } from "@/components/products/search-form";
import { SortControl } from "@/components/products/sort-control";
import { PaginationControls } from "@/components/products/pagination-controls";
import { EmptyState } from "@/components/products/empty-state";
import { getProductsEmptyState } from "@/lib/products/empty-state";
import {
  parseProductListQuery,
  type RawProductSearchParams,
} from "@/lib/products/query-params";
import { getCategories, getProductListing } from "@/lib/products/queries";

export const metadata: Metadata = {
  title: "สินค้าทั้งหมด | CodingThailand",
  description: "เลือกซื้อสมาร์ทโฟน แล็ปท็อป และอุปกรณ์เสริมคุณภาพดี ราคาคุ้มค่า",
};

type ProductsPageProps = {
  searchParams: Promise<RawProductSearchParams>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const query = parseProductListQuery(await searchParams);

  const [categories, listing] = await Promise.all([
    getCategories(),
    getProductListing(query),
  ]);

  const emptyState = getProductsEmptyState(query, listing);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <Reveal className="text-center">
        <h1 className="font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          สินค้าทั้งหมด
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          เลือกซื้อสมาร์ทโฟน แล็ปท็อป และอุปกรณ์เสริมคุณภาพดี ราคาคุ้มค่า
        </p>
      </Reveal>

      <Reveal
        delay={80}
        className="mt-10 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <SearchForm query={query} />
        <SortControl query={query} />
      </Reveal>

      <Reveal delay={120} className="mt-6">
        <CategoryFilter categories={categories} query={query} />
      </Reveal>

      {emptyState ? (
        <div className="mt-10">
          <EmptyState state={emptyState} />
        </div>
      ) : (
        <>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {listing.items.map((product, i) => (
              <Reveal key={product.id} delay={i * 60} className="h-full">
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>

          <PaginationControls query={query} totalPages={listing.totalPages} />
        </>
      )}
    </div>
  );
}
