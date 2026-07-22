import Link from "next/link";
import {
  BadgePercent,
  ChevronRight,
  CreditCard,
  Headphones,
  Laptop,
  Package,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Star,
  Tablet,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

const FEATURED_CATEGORY = {
  name: "สมาร์ทโฟน",
  description: "ค้นพบสมาร์ทโฟนรุ่นล่าสุดจากทุกแบรนด์ชั้นนำ ครบทุกไลน์ ทุกงบประมาณ",
  icon: Smartphone,
};

const CATEGORIES = [
  { name: "แล็ปท็อป", icon: Laptop },
  { name: "หูฟัง", icon: Headphones },
  { name: "แท็บเล็ต", icon: Tablet },
  { name: "อุปกรณ์เสริม", icon: Package },
];

const FEATURED_PRODUCT = {
  name: "iPhone 16 Pro",
  description: "สมาร์ทโฟน Apple จอ 6.3 นิ้ว ชิป A18 Pro กล้องระดับโปร แบตอึดตลอดวัน",
  price: 45900,
  originalPrice: 49900,
  tag: "สินค้าขายดีอันดับ 1",
};

const PRODUCTS = [
  {
    name: "Samsung Galaxy S25",
    description: "สมาร์ทโฟน Samsung จอ 6.2 นิ้ว ชิป Snapdragon 8 Elite",
    price: 32900,
    tag: "มาใหม่",
  },
  {
    name: "MacBook Air M3",
    description: "แล็ปท็อป Apple จอ 15 นิ้ว RAM 16GB SSD 512GB",
    price: 44900,
    tag: "ขายดี",
  },
  {
    name: "AirPods Pro 2",
    description: "หูฟังไร้สาย Apple ตัดเสียงรบกวน USB-C",
    price: 8990,
    originalPrice: 10900,
    tag: "ลดราคา",
  },
  {
    name: "iPad Air M2",
    description: "แท็บเล็ต Apple จอ 13 นิ้ว ชิป M2",
    price: 33900,
    tag: "มาใหม่",
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
    icon: RotateCcw,
    title: "คืนสินค้าได้ภายใน 15 วัน",
    description: "ไม่พอใจสินค้า เปลี่ยนหรือคืนได้ง่าย ไม่มีค่าใช้จ่าย",
  },
  {
    icon: BadgePercent,
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
      <section className="bg-background">
        <div className="mx-auto max-w-3xl px-4 pt-20 pb-4 text-center sm:px-6 sm:pt-28 lg:px-8">
          <p className="animate-in fade-in slide-in-from-bottom-2 text-sm font-medium tracking-wide text-muted-foreground duration-700">
            ShopSense · คอลเลกชันซัมเมอร์ 2026
          </p>
          <h1 className="mt-3 animate-in fade-in slide-in-from-bottom-4 text-4xl font-semibold tracking-tight text-foreground duration-700 sm:text-6xl">
            อัปเกรดไลฟ์สไตล์ดิจิทัล
            <br />
            ของคุณให้ล้ำกว่าเดิม
          </h1>
          <p className="mx-auto mt-5 max-w-xl animate-in fade-in slide-in-from-bottom-4 text-base text-muted-foreground duration-700 sm:text-lg">
            เลือกซื้อสมาร์ทโฟน แล็ปท็อป และอุปกรณ์เสริมรุ่นล่าสุดจากแบรนด์ชั้นนำ
            พร้อมส่งฟรีและรับประกันสินค้าแท้ทุกชิ้น
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Button
              size="lg"
              className="rounded-full px-7 transition-transform active:scale-95"
              render={<Link href="#products" />}
              nativeButton={false}
            >
              เลือกซื้อสินค้า
            </Button>
            <Link
              href="#categories"
              className="inline-flex items-center gap-1 text-base font-medium text-primary hover:underline"
            >
              ดูหมวดหมู่ทั้งหมด
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>

        <Reveal className="mx-auto max-w-6xl px-4 pt-14 pb-16 sm:px-6 sm:pt-20 lg:px-8">
          <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-3xl bg-secondary/60 sm:aspect-[21/9]">
            <div className="absolute size-64 rounded-full bg-foreground/5 blur-3xl sm:size-80" />
            <Smartphone
              className="relative size-28 text-foreground/70 transition-transform duration-500 hover:scale-105 sm:size-36"
              strokeWidth={1}
            />
            <div className="absolute bottom-6 right-6 hidden items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 shadow-sm sm:flex">
              <Star className="size-4 fill-foreground text-foreground" />
              <div className="text-left text-xs">
                <p className="font-semibold text-foreground">4.9 / 5.0</p>
                <p className="text-muted-foreground">จากผู้ซื้อกว่า 1,200 คน</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Categories */}
      <section id="categories" className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              เลือกซื้อตามหมวดหมู่
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              ครอบคลุมทุกความต้องการด้านดิจิทัลไลฟ์สไตล์
            </p>
          </Reveal>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:auto-rows-[9.5rem]">
            <Reveal className="col-span-2 sm:col-span-2 sm:row-span-2">
              <Link
                href="#products"
                className="group flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-secondary/60 p-6 transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-8"
              >
                <span className="flex size-14 items-center justify-center rounded-full bg-background text-foreground shadow-sm transition-transform group-hover:scale-105">
                  <FEATURED_CATEGORY.icon className="size-6" strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-lg font-semibold text-foreground sm:text-xl">
                    {FEATURED_CATEGORY.name}
                  </p>
                  <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                    {FEATURED_CATEGORY.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    ดูสินค้าทั้งหมด
                    <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </Reveal>

            {CATEGORIES.map((category, i) => (
              <Reveal key={category.name} delay={(i + 1) * 60}>
                <Link
                  href="#products"
                  className="group flex h-full flex-col items-center justify-center gap-3 rounded-2xl bg-secondary/60 p-6 text-center transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="flex size-14 items-center justify-center rounded-full bg-background text-foreground shadow-sm transition-transform group-hover:scale-105">
                    <category.icon className="size-6" strokeWidth={1.5} />
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
      <section id="products" className="border-t border-border bg-secondary/30 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-10 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              สินค้าขายดีประจำสัปดาห์
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              คัดมาให้แล้วจากสินค้าที่ลูกค้าสั่งซื้อมากที่สุด
            </p>
          </Reveal>

          <Reveal className="mb-6">
            <div className="flex flex-col items-center gap-8 rounded-3xl bg-background p-8 text-center sm:flex-row sm:p-12 sm:text-left">
              <div className="flex aspect-square w-40 shrink-0 items-center justify-center rounded-2xl bg-secondary/60 sm:w-56">
                <Smartphone className="size-20 text-foreground/70" strokeWidth={1} />
              </div>
              <div>
                <p className="text-xs font-medium tracking-wide text-primary">
                  {FEATURED_PRODUCT.tag}
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-foreground">
                  {FEATURED_PRODUCT.name}
                </h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  {FEATURED_PRODUCT.description}
                </p>
                <div className="mt-4 flex items-baseline justify-center gap-2 sm:justify-start">
                  <span className="text-xl font-semibold text-foreground">
                    {currency.format(FEATURED_PRODUCT.price)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {currency.format(FEATURED_PRODUCT.originalPrice)}
                  </span>
                </div>
                <div className="mt-5 flex items-center justify-center gap-6 sm:justify-start">
                  <button
                    type="button"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    ซื้อเลย
                  </button>
                  <Link
                    href="#"
                    className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
                  >
                    ดูรายละเอียด
                    <ChevronRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS.map((product, i) => (
              <Reveal key={product.name} delay={i * 60}>
                <div className="group flex flex-col items-center rounded-3xl bg-background p-8 text-center transition-shadow duration-300 hover:shadow-lg">
                  <div className="flex aspect-square w-full items-center justify-center">
                    <Smartphone
                      className="size-16 text-foreground/70 transition-transform duration-500 group-hover:scale-105"
                      strokeWidth={1}
                    />
                  </div>
                  <p
                    className={cn(
                      "mt-4 text-xs font-medium tracking-wide",
                      product.tag === "ลดราคา" ? "text-destructive" : "text-primary"
                    )}
                  >
                    {product.tag}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-foreground">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {product.description}
                  </p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-base font-medium text-foreground">
                      {currency.format(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {currency.format(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="mt-4 text-sm font-medium text-primary transition-opacity hover:underline"
                  >
                    ซื้อเลย
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Promo banner */}
      <section id="promo" className="py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <Reveal className="lg:col-span-2">
            <div className="flex h-full flex-col items-center justify-center rounded-3xl bg-foreground px-8 py-16 text-center text-background sm:px-16">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                ลดสูงสุด 20% สำหรับสมาชิกใหม่
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-background/70 sm:text-base">
                สมัครสมาชิกวันนี้ รับคูปองส่วนลดทันที พร้อมสิทธิพิเศษส่งฟรีตลอดปี
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="mt-6 rounded-full px-7 transition-transform active:scale-95"
                render={<Link href="#" />}
                nativeButton={false}
              >
                สมัครสมาชิกเลย
              </Button>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="flex h-full flex-col items-center justify-center gap-3 rounded-3xl bg-secondary/60 px-8 py-16 text-center">
              <CreditCard className="size-8 text-foreground" strokeWidth={1.5} />
              <h3 className="text-xl font-semibold text-foreground">
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
              <perk.icon className="size-6 text-foreground" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold text-foreground">{perk.title}</p>
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
