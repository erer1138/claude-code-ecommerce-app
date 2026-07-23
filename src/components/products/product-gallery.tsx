"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import {
  PRODUCT_IMAGE_PLACEHOLDER_ALT,
  PRODUCT_IMAGE_PLACEHOLDER_URL,
} from "@/lib/products/image";

export type GalleryImage = {
  id: number;
  url: string;
};

export function ProductGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-secondary/40">
        <Image
          src={PRODUCT_IMAGE_PLACEHOLDER_URL}
          alt={`${productName} (${PRODUCT_IMAGE_PLACEHOLDER_ALT})`}
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-contain p-16 opacity-60"
        />
      </div>
    );
  }

  const active = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-secondary/40">
        <Image
          key={active.id}
          src={active.url}
          alt={productName}
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover"
          priority
        />
      </div>

      {images.length > 1 && (
        <div
          role="tablist"
          aria-label={`รูปภาพสินค้า ${productName}`}
          className="flex gap-2"
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`รูปที่ ${index + 1} ของ ${productName}`}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-square w-16 shrink-0 overflow-hidden rounded-md transition-colors duration-300 ease-out",
                index === activeIndex
                  ? "border-2 border-foreground"
                  : "border border-border hover:border-foreground/50"
              )}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
