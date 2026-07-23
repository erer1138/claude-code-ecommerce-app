import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { formatPriceTHB } from "@/lib/currency";
import {
  PRODUCT_IMAGE_PLACEHOLDER_ALT,
  resolveProductImageUrl,
} from "@/lib/products/image";
import type { ProductListItem } from "@/lib/products/types";

export function ProductCard({ product }: { product: ProductListItem }) {
  const isPlaceholder = !product.mainImageName;
  const imageUrl = resolveProductImageUrl(product.mainImageName);
  const alt = isPlaceholder
    ? `${product.name} (${PRODUCT_IMAGE_PLACEHOLDER_ALT})`
    : product.name;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-secondary/40">
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className={cn(
            "transition-transform duration-300 ease-out group-hover:scale-105",
            isPlaceholder ? "object-contain p-10 opacity-60" : "object-cover"
          )}
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-medium text-foreground">
          {product.name}
        </h3>
        <p className="mt-auto pt-3 text-base font-medium text-foreground">
          {formatPriceTHB(product.price)}
        </p>
      </div>
    </Link>
  );
}
