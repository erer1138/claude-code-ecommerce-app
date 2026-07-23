import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react/ssr";

import { Badge } from "@/components/ui/badge";
import { ProductGallery } from "@/components/products/product-gallery";
import { formatPriceTHB } from "@/lib/currency";
import { resolveProductImageUrl } from "@/lib/products/image";
import { parsePositiveInt } from "@/lib/products/query-params";
import { getProductDetail } from "@/lib/products/queries";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const id = parsePositiveInt((await params).id);
  const product = id ? await getProductDetail(id) : null;

  return {
    title: product ? `${product.name} | CodingThailand` : "ไม่พบสินค้า | CodingThailand",
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const id = parsePositiveInt((await params).id);
  if (!id) notFound();

  const product = await getProductDetail(id);
  if (!product) notFound();

  const galleryImages = product.images.map((image) => ({
    id: image.id,
    url: resolveProductImageUrl(image.imageName),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors duration-300 ease-out hover:text-foreground"
      >
        <CaretLeft weight="bold" className="size-4" />
        กลับไปหน้าสินค้าทั้งหมด
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={galleryImages} productName={product.name} />

        <div>
          {product.category && (
            <Badge variant="outline">{product.category.name}</Badge>
          )}
          <h1 className="mt-3 font-heading text-3xl font-medium tracking-tight text-foreground">
            {product.name}
          </h1>
          <p className="mt-4 text-2xl font-medium text-foreground">
            {formatPriceTHB(product.price)}
          </p>
          {product.description && (
            <p className="mt-6 max-w-lg text-base leading-relaxed whitespace-pre-line text-muted-foreground">
              {product.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
