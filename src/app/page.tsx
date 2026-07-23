import Image from "next/image";
import Link from "next/link";
import {
  ArrowCounterClockwise,
  CaretRight,
  CreditCard,
  DeviceMobile,
  DeviceTablet,
  Headphones,
  Laptop,
  Package,
  Percent,
  ShieldCheck,
  Star,
  Truck,
} from "@phosphor-icons/react/ssr";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/reveal";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { cn } from "@/lib/utils";

const FEATURED_CATEGORY = {
  name: "สมาร์ทโฟน",
  description: "ค้นพบสมาร์ทโฟนรุ่นล่าสุดจากทุกแบรนด์ชั้นนำ ครบทุกไลน์ ทุกงบประมาณ",
  icon: DeviceMobile,
};

const CATEGORIES = [
  { name: "แล็ปท็อป", icon: Laptop },
  { name: "หูฟัง", icon: Headphones },
  { name: "แท็บเล็ต", icon: DeviceTablet },
  { name: "อุปกรณ์เสริม", icon: Package },
];

const FEATURED_PRODUCT = {
  name: "iPhone 16 Pro",
  description: "สมาร์ทโฟน Apple จอ 6.3 นิ้ว ชิป A18 Pro กล้องระดับโปร แบตอึดตลอดวัน",
  price: 45900,
  originalPrice: 49900,
  tag: "สินค้าขายดีอันดับ 1",
  tagVariant: "yellow" as const,
  image: "/product-image/iphone16pro-front.jpg",
};

const PRODUCTS = [
  {
    name: "Samsung Galaxy S25",
    description: "สมาร์ทโฟน Samsung จอ 6.2 นิ้ว ชิป Snapdragon 8 Elite",
    price: 32900,
    tag: "มาใหม่",
    tagVariant: "blue" as const,
    image: "/product-image/galaxy-s25-front.jpg",
  },
  {
    name: "MacBook Air M3",
    description: "แล็ปท็อป Apple จอ 15 นิ้ว RAM 16GB SSD 512GB",
    price: 44900,
    tag: "ขายดี",
    tagVariant: "green" as const,
    image: "/product-image/macbook-air-m3-silver.jpg",
  },
  {
    name: "AirPods Pro 2",
    description: "หูฟังไร้สาย Apple ตัดเสียงรบกวน USB-C",
    price: 8990,
    originalPrice: 10900,
    tag: "ลดราคา",
    tagVariant: "red" as const,
    image: "/product-image/airpods-pro2-case.jpg",
  },
  {
    name: "iPad Air M2",
    description: "แท็บเล็ต Apple จอ 13 นิ้ว ชิป M2",
    price: 33900,
    tag: "มาใหม่",
    tagVariant: "blue" as const,
    image: "/product-image/nopic.png",
  },
];

const PERKS = [
  {
    icon: Truck,
    title: "ส่งฟรีทั่วประเทศ",
    description: "เมื่อซื้อครบ 1,500 บาท จัดส่งถึงบ้านภายใน 2-3 วัน",
  },
  {
    icon: ShieldCheck,
    title: "รับประกันสินค้าแท้ 100%",
    description: "สินค้าทุกชิ้นมีใบรับประกันจากศูนย์บริการทั่วประเทศ",
  },
  {
    icon: ArrowCounterClockwise,
    title: "คืนสินค้าได้ภายใน 15 วัน",
    description: "ไม่พอใจสินค้า เปลี่ยนหรือคืนได้ง่าย ไม่มีค่าใช้จ่าย",
  },
  {
    icon: Percent,
    title: "โปรโมชั่นทุกสัปดาห์",
    description: "ส่วนลดพิเศษและคูปองใหม่ อัปเดตให้ทุกสัปดาห์",
  },
];

const currency = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-background">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,oklch(0.6_0.03_60/0.05),transparent_70%)]"
        />

        <div className="relative mx-auto max-w-3xl px-4 pt-24 pb-4 text-center sm:px-6 sm:pt-32 lg:px-8">
          <p className="animate-in fade-in slide-in-from-bottom-2 font-mono text-xs tracking-[0.15em] text-muted-foreground uppercase duration-700">
            ShopSense · คอลเลกชันซัมเมอร์ 2026
          </p>
          <h1 className="animate-in fade-in slide-in-from-bottom-4 mt-4 font-heading text-5xl leading-[1.1] font-medium tracking-tight text-foreground duration-700 delay-100 fill-mode-both sm:text-7xl">
            อัปเกรดไลฟ์สไตล์ดิจิทัล
            <br />
            ของคุณให้ล้ำกว่าเดิม
          </h1>
          <p className="animate-in fade-in slide-in-from-bottom-4 mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground duration-700 delay-200 fill-mode-both sm:text-lg">
            เลือกซื้อสมาร์ทโฟน แล็ปท็อป และอุปกรณ์เสริมรุ่นล่าสุดจากแบรนด์ชั้นนำ
            พร้อมส่งฟรีและรับประกันสินค้าแท้ทุกชิ้น
          </p>
          <div className="animate-in fade-in slide-in-from-bottom-4 mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 duration-700 delay-300 fill-mode-both">
            <Button
              size="lg"
              className="group/cta px-7"
              render={<Link href="#products" />}
              nativeButton={false}
            >
              <span className="flex items-center">
                เลือกซื้อสินค้า
                <CaretRight
                  weight="bold"
                  className="size-0 max-w-0 opacity-0 transition-all duration-300 ease-out group-hover/cta:ml-1.5 group-hover/cta:size-4 group-hover/cta:max-w-4 group-hover/cta:opacity-100"
                />
              </span>
            </Button>
            <Link
              href="#categories"
              className="group/link inline-flex items-center gap-1 text-base font-medium text-foreground hover:underline"
            >
              ดูหมวดหมู่ทั้งหมด
              <CaretRight
                weight="bold"
                className="size-4 transition-transform duration-300 ease-out group-hover/link:translate-x-0.5"
              />
            </Link>
          </div>
        </div>

        <Reveal className="relative mx-auto max-w-6xl px-4 pt-14 pb-16 sm:px-6 sm:pt-20 lg:px-8">
          <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-card sm:aspect-[21/9]">
            <DeviceMobile
              weight="thin"
              className="relative size-28 text-foreground/60 sm:size-36"
            />
            <div className="absolute right-6 bottom-6 hidden items-center gap-2 rounded-md border border-border bg-background px-4 py-3 sm:flex">
              <Star weight="fill" className="size-4 text-foreground" />
              <div className="text-left text-xs">
                <p className="font-medium text-foreground">4.9 / 5.0</p>
                <p className="text-muted-foreground">จากผู้ซื้อกว่า 1,200 คน</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Categories */}
      <section id="categories" className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-10 text-center">
            <h2 className="font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              เลือกซื้อตามหมวดหมู่
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              ครอบคลุมทุกความต้องการด้านดิจิทัลไลฟ์สไตล์
            </p>
          </Reveal>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:auto-rows-[9.5rem]">
            <Reveal className="col-span-2 sm:col-span-2 sm:row-span-2">
              <Link
                href="#products"
                className="group flex h-full flex-col justify-between rounded-xl border border-border bg-card p-6 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:p-8"
              >
                <span className="flex size-14 items-center justify-center rounded-md border border-border bg-background text-foreground">
                  <FEATURED_CATEGORY.icon
                    className="size-6 transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110"
                    weight="light"
                  />
                </span>
                <div>
                  <p className="text-lg font-medium text-foreground sm:text-xl">
                    {FEATURED_CATEGORY.name}
                  </p>
                  <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                    {FEATURED_CATEGORY.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-foreground">
                    ดูสินค้าทั้งหมด
                    <CaretRight
                      weight="bold"
                      className="size-4 transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </Link>
            </Reveal>

            {CATEGORIES.map((category, i) => (
              <Reveal key={category.name} delay={(i + 1) * 60}>
                <Link
                  href="#products"
                  className="group flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-6 text-center transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                >
                  <span className="flex size-14 items-center justify-center rounded-md border border-border bg-background text-foreground">
                    <category.icon
                      className="size-6 transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110"
                      weight="light"
                    />
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {category.name}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="border-t border-border bg-secondary/30 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              สินค้าขายดีประจำสัปดาห์
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              คัดมาให้แล้วจากสินค้าที่ลูกค้าสั่งซื้อมากที่สุด
            </p>
          </Reveal>

          <Reveal className="mb-6">
            <div className="flex flex-col items-center gap-8 rounded-xl border border-border bg-card p-8 text-center sm:flex-row sm:p-12 sm:text-left">
              <div className="relative aspect-square w-40 shrink-0 overflow-hidden rounded-xl border border-border bg-background sm:w-56">
                <Image
                  src={FEATURED_PRODUCT.image}
                  alt={FEATURED_PRODUCT.name}
                  fill
                  sizes="(min-width: 640px) 14rem, 10rem"
                  className="object-cover"
                />
              </div>
              <div>
                <Badge variant={FEATURED_PRODUCT.tagVariant} dot>
                  {FEATURED_PRODUCT.tag}
                </Badge>
                <h3 className="mt-2 font-heading text-2xl font-medium text-foreground">
                  {FEATURED_PRODUCT.name}
                </h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  {FEATURED_PRODUCT.description}
                </p>
                <div className="mt-4 flex items-baseline justify-center gap-2 sm:justify-start">
                  <span className="text-xl font-medium text-foreground">
                    {currency.format(FEATURED_PRODUCT.price)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {currency.format(FEATURED_PRODUCT.originalPrice)}
                  </span>
                </div>
                <div className="mt-5 flex items-center justify-center gap-6 sm:justify-start">
                  <AddToCartButton />
                  <Link
                    href="#"
                    className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
                  >
                    ดูรายละเอียด
                    <CaretRight weight="bold" className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS.map((product, i) => (
              <Reveal key={product.name} delay={i * 60} className="h-full">
                <div className="group flex h-full flex-col items-center rounded-xl border border-border bg-card p-8 text-center transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                      className={cn(
                        "transition-transform duration-300 ease-out group-hover:scale-110",
                        product.image.endsWith("nopic.png")
                          ? "object-contain p-8 opacity-60"
                          : "object-cover"
                      )}
                    />
                  </div>
                  <Badge variant={product.tagVariant} dot className="mt-4">
                    {product.tag}
                  </Badge>
                  <h3 className="mt-2 text-base font-medium text-foreground">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {product.description}
                  </p>
                  <div className="mt-auto flex items-baseline gap-2 pt-3">
                    <span className="text-base font-medium text-foreground">
                      {currency.format(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {currency.format(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <AddToCartButton className="mt-4" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Promo banner */}
      <section id="promo" className="py-24 sm:py-32">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <Reveal className="lg:col-span-2">
            <div className="flex h-full flex-col items-center justify-center rounded-xl bg-foreground px-8 py-16 text-center text-background sm:px-16">
              <h2 className="font-heading text-3xl font-medium tracking-tight sm:text-4xl">
                ลดสูงสุด 20% สำหรับสมาชิกใหม่
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-background/70 sm:text-base">
                สมัครสมาชิกวันนี้ รับคูปองส่วนลดทันที พร้อมสิทธิพิเศษส่งฟรีตลอดปี
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="mt-6 px-7"
                render={<Link href="#" />}
                nativeButton={false}
              >
                สมัครสมาชิกเลย
              </Button>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-8 py-16 text-center">
              <CreditCard weight="light" className="size-8 text-foreground" />
              <h3 className="text-xl font-medium text-foreground">
                ผ่อน 0% สูงสุด 10 เดือน
              </h3>
              <p className="text-sm text-muted-foreground">
                ผ่านบัตรเครดิตที่ร่วมรายการ ช้อปวันนี้ ผ่อนสบายไม่มีดอกเบี้ย
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Perks */}
      <section className="border-t border-border">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:divide-x lg:divide-border lg:px-8">
          {PERKS.map((perk, i) => (
            <Reveal
              key={perk.title}
              delay={i * 75}
              className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left lg:pl-8 lg:first:pl-0"
            >
              <perk.icon weight="light" className="size-6 text-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">{perk.title}</p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                  {perk.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
