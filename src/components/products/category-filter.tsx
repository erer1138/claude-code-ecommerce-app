import Link from "next/link";
import { Check } from "@phosphor-icons/react/ssr";

import { cn } from "@/lib/utils";
import { buildProductsHref } from "@/lib/products/query-params";
import type { ProductCategory, ProductListQuery } from "@/lib/products/types";

export function CategoryFilter({
  categories,
  query,
}: {
  categories: ProductCategory[];
  query: ProductListQuery;
}) {
  const items: Array<{ id: number | null; name: string }> = [
    { id: null, name: "ทั้งหมด" },
    ...categories,
  ];

  return (
    <nav aria-label="กรองตามหมวดหมู่" className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isSelected = item.id === query.category;
        const href = buildProductsHref({
          q: query.q,
          sort: query.sort,
          category: item.id,
        });

        return (
          <Link
            key={item.name}
            href={href}
            aria-current={isSelected ? "true" : undefined}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors duration-300 ease-out",
              isSelected
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {isSelected && <Check weight="bold" className="size-3.5" />}
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
