export const PRODUCTS_PAGE_SIZE = 12;

export type ProductSort = "price_asc" | "price_desc";

export type ProductListQuery = {
  q: string;
  category: number | null;
  page: number;
  sort: ProductSort | null;
};

export type ProductListItem = {
  id: number;
  name: string;
  price: string | number;
  mainImageName: string | null;
};

export type ProductListResult = {
  items: ProductListItem[];
  totalItems: number;
  page: number;
  pageSize: typeof PRODUCTS_PAGE_SIZE;
  totalPages: number;
};

export type ProductCategory = {
  id: number;
  name: string;
};

export type ProductDetailImage = {
  id: number;
  imageName: string;
  createdAt: string | null;
};

export type ProductDetail = {
  id: number;
  name: string;
  description: string | null;
  price: string | number;
  category: ProductCategory | null;
  images: ProductDetailImage[];
};
