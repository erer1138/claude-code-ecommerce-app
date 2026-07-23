export const PRODUCT_IMAGE_PLACEHOLDER_URL = "/product-image/nopic.png";
export const PRODUCT_IMAGE_PLACEHOLDER_ALT = "ไม่มีรูปภาพสินค้า";

// NOTE: The Supabase Storage bucket `product-images` referenced by
// `product_images.image_name` (e.g. "products/2/iphone16pro-front.jpg") has
// no objects uploaded to it in this environment, and uploading requires an
// admin/service-role credential this app doesn't have. Until real files are
// uploaded to Storage, resolve by basename against the local public copies
// in `public/product-image/` instead. Swapping back to
// `supabase.storage.from("product-images").getPublicUrl(imageName)` is a
// one-line change once Storage is populated.
export function resolveProductImageUrl(imageName: string | null): string {
  if (!imageName) return PRODUCT_IMAGE_PLACEHOLDER_URL;

  const basename = imageName.split("/").pop() ?? imageName;
  return `/product-image/${basename}`;
}
