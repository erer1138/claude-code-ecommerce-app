import Link from "next/link";
import { Check } from "@phosphor-icons/react/ssr";

import { cn } from "@/lib/utils";
import { buildProductsHref } from "@/lib/products/query-params";
import type { ProductListQuery, ProductSort } from "@/lib/products/types";

const SORT_OPTIONS: Array<{ value: ProductSort | null; label: string }> = [
  { value: null, label: "ค่าเริ่มต้น" },
  { value: "price_asc", label: "ราคา: น้อยไปมาก" },
  { value: "price_desc", label: "ราคา: มากไปน้อย" },
];

export function SortControl({ query }: { query: ProductListQuery }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-muted-foreground">เรียงตาม:</span>
      <nav aria-label="เรียงลำดับสินค้า" className="flex flex-wrap gap-2">
        {SORT_OPTIONS.map((option) => {
          const isSelected = option.value === query.sort;

          return (
            <Link
              key={option.label}
              href={buildProductsHref({
                q: query.q,
                category: query.category,
                sort: option.value,
              })}
              aria-current={isSelected ? "true" : undefined}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors duration-300 ease-out",
                isSelected
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isSelected && <Check weight="bold" className="size-3" />}
              {option.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
