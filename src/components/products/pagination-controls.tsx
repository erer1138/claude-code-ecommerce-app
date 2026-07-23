import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/ssr";

import { cn } from "@/lib/utils";
import { buildProductsHref } from "@/lib/products/query-params";
import type { ProductListQuery } from "@/lib/products/types";

const baseClass =
  "inline-flex items-center gap-1.5 rounded-md border px-4 py-2 text-sm font-medium transition-colors duration-300 ease-out";

export function PaginationControls({
  query,
  totalPages,
}: {
  query: ProductListQuery;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const isFirstPage = query.page <= 1;
  const isLastPage = query.page >= totalPages;

  return (
    <nav
      aria-label="แบ่งหน้าสินค้า"
      className="mt-10 flex items-center justify-center gap-3"
    >
      {isFirstPage ? (
        <span
          aria-disabled="true"
          className={cn(baseClass, "border-border text-muted-foreground/40")}
        >
          <CaretLeft weight="bold" className="size-4" />
          ก่อนหน้า
        </span>
      ) : (
        <Link
          href={buildProductsHref({ ...query, page: query.page - 1 })}
          className={cn(baseClass, "border-border text-foreground hover:bg-muted")}
        >
          <CaretLeft weight="bold" className="size-4" />
          ก่อนหน้า
        </Link>
      )}

      <span className="text-sm text-muted-foreground">
        หน้า {query.page} จาก {totalPages}
      </span>

      {isLastPage ? (
        <span
          aria-disabled="true"
          className={cn(baseClass, "border-border text-muted-foreground/40")}
        >
          ถัดไป
          <CaretRight weight="bold" className="size-4" />
        </span>
      ) : (
        <Link
          href={buildProductsHref({ ...query, page: query.page + 1 })}
          className={cn(baseClass, "border-border text-foreground hover:bg-muted")}
        >
          ถัดไป
          <CaretRight weight="bold" className="size-4" />
        </Link>
      )}
    </nav>
  );
}
