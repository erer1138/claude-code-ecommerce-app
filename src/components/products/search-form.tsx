import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react/ssr";

import { Button } from "@/components/ui/button";
import { buildProductsHref } from "@/lib/products/query-params";
import type { ProductListQuery } from "@/lib/products/types";

export function SearchForm({ query }: { query: ProductListQuery }) {
  return (
    <div className="flex flex-col gap-2">
      <form
        action="/products"
        method="GET"
        role="search"
        className="flex w-full max-w-sm items-center gap-2"
      >
        <label htmlFor="product-search" className="sr-only">
          ค้นหาสินค้าตามชื่อ
        </label>
        <input
          id="product-search"
          type="search"
          name="q"
          defaultValue={query.q}
          placeholder="ค้นหาสินค้า..."
          className="h-10 w-full rounded-md border border-border bg-input/30 px-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        {query.category && (
          <input type="hidden" name="category" value={query.category} />
        )}
        {query.sort && <input type="hidden" name="sort" value={query.sort} />}
        <Button type="submit" size="icon" variant="outline" aria-label="ค้นหาสินค้า">
          <MagnifyingGlass weight="bold" />
        </Button>
      </form>

      {query.q && (
        <Link
          href={buildProductsHref({ category: query.category, sort: query.sort })}
          className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
        >
          ล้างคำค้นหา
        </Link>
      )}
    </div>
  );
}
