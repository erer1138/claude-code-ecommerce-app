"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Heart,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "หน้าแรก", href: "#" },
  { label: "สินค้าทั้งหมด", href: "#products" },
  { label: "หมวดหมู่", href: "#categories" },
  { label: "โปรโมชั่น", href: "#promo" },
  { label: "เกี่ยวกับเรา", href: "#" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-muted lg:hidden"
          aria-label="เปิดเมนู"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <Link href="#" className="flex items-center gap-2 shrink-0">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            S
          </span>
          <span className="hidden text-lg font-semibold tracking-tight text-foreground sm:inline">
            ShopSense
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex flex-1 items-center justify-end gap-1 sm:flex-none sm:gap-2">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="ค้นหาสินค้า..."
              className="h-9 w-40 rounded-full border border-border bg-input/30 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 lg:w-56 xl:w-72"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="ค้นหา"
          >
            <Search />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            aria-label="รายการที่ชอบ"
          >
            <Heart />
          </Button>
          <Button variant="ghost" size="icon" aria-label="บัญชีผู้ใช้">
            <User />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="ตะกร้าสินค้า"
          >
            <ShoppingCart />
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
