"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Heart,
  List,
  MagnifyingGlass,
  ShoppingCart,
  User,
  X,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "หน้าแรก", href: "#" },
  { label: "สินค้าทั้งหมด", href: "/products" },
  { label: "หมวดหมู่", href: "#categories" },
  { label: "โปรโมชั่น", href: "#promo" },
  { label: "เกี่ยวกับเรา", href: "#" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likePulse, setLikePulse] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-muted lg:hidden"
          aria-label="เปิดเมนู"
        >
          {menuOpen ? (
            <X className="size-5" weight="bold" />
          ) : (
            <List className="size-5" weight="bold" />
          )}
        </button>

        <Link href="#" className="flex items-center gap-2 shrink-0">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
            S
          </span>
          <span className="hidden font-heading text-lg font-medium tracking-tight text-foreground sm:inline">
            ShopSense
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="relative py-1 transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-foreground after:transition-transform after:duration-300 after:content-[''] hover:text-foreground hover:after:scale-x-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex flex-1 items-center justify-end gap-1 sm:flex-none sm:gap-2">
          <div className="relative hidden md:block">
            <MagnifyingGlass
              weight="bold"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              placeholder="ค้นหาสินค้า..."
              className="h-9 w-40 rounded-md border border-border bg-input/30 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 lg:w-56 xl:w-72"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="ค้นหา"
          >
            <MagnifyingGlass
              weight="bold"
              className="transition-transform duration-300 ease-out group-hover/button:scale-110"
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            aria-label={liked ? "นำออกจากรายการที่ชอบ" : "เพิ่มในรายการที่ชอบ"}
            onClick={() => {
              setLiked((v) => !v);
              setLikePulse(true);
            }}
          >
            <Heart
              weight={liked ? "fill" : "bold"}
              onAnimationEnd={() => setLikePulse(false)}
              className={cn(
                "transition-colors duration-300 ease-out",
                liked && "text-destructive",
                likePulse && "animate-pop"
              )}
            />
          </Button>
          <Button variant="ghost" size="icon" aria-label="บัญชีผู้ใช้">
            <User
              weight="bold"
              className="transition-transform duration-300 ease-out group-hover/button:scale-110"
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="ตะกร้าสินค้า"
          >
            <ShoppingCart
              weight="bold"
              className="transition-transform duration-300 ease-out group-hover/button:-rotate-6 group-hover/button:scale-110"
            />
            <span className="absolute -top-1 -right-1 flex size-4.5 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
              3
            </span>
          </Button>
        </div>
      </div>

      <nav
        className={cn(
          "flex flex-col gap-1 border-t border-border bg-background px-4 py-3 text-sm font-medium text-muted-foreground lg:hidden",
          menuOpen ? "block" : "hidden"
        )}
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            className="rounded-md px-2 py-2 transition-colors hover:bg-muted hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
