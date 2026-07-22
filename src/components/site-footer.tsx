import Link from "next/link";
import {
  EnvelopeSimple,
  FacebookLogo,
  InstagramLogo,
  MapPin,
  Phone,
  XLogo,
} from "@phosphor-icons/react/ssr";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const FOOTER_COLUMNS = [
  {
    title: "ช้อปปิ้ง",
    links: ["สินค้าทั้งหมด", "สมาร์ทโฟน", "แล็ปท็อป", "หูฟัง", "แท็บเล็ต", "อุปกรณ์เสริม"],
  },
  {
    title: "บริการลูกค้า",
    links: ["ติดตามคำสั่งซื้อ", "นโยบายการคืนสินค้า", "การจัดส่งสินค้า", "คำถามที่พบบ่อย", "ติดต่อเรา"],
  },
  {
    title: "บริษัท",
    links: ["เกี่ยวกับเรา", "ร่วมงานกับเรา", "ข่าวสาร", "ข้อกำหนดการใช้งาน", "ความเป็นส่วนตัว"],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 border-b border-border pb-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-heading text-xl font-medium tracking-tight text-foreground">
              รับข่าวสารและโปรโมชั่นก่อนใคร
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              สมัครรับอีเมลเพื่อรับส่วนลดพิเศษและอัปเดตสินค้าใหม่
            </p>
          </div>
          <form className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row sm:items-center">
            <input
              type="email"
              required
              placeholder="อีเมลของคุณ"
              className="h-10 w-full flex-1 rounded-md border border-border bg-input/30 px-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <Button type="submit" className="shrink-0 sm:w-auto">
              สมัครรับข่าวสาร
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-10 py-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="#" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                S
              </span>
              <span className="font-heading text-lg font-medium tracking-tight text-foreground">
                ShopSense
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              ร้านค้าออนไลน์ที่รวมสมาร์ทโฟน แล็ปท็อป และอุปกรณ์เสริมคุณภาพดี ราคาคุ้มค่า
              ส่งตรงถึงบ้านคุณ
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin weight="bold" className="size-4 shrink-0" />
              <span>123 ถ.สุขุมวิท กรุงเทพฯ 10110</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Phone weight="bold" className="size-4 shrink-0" />
              <span>02-123-4567</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <EnvelopeSimple weight="bold" className="size-4 shrink-0" />
              <span>support@shopsense.dev</span>
            </div>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h4 className="text-sm font-semibold text-foreground">
                {column.title}
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="transition-colors hover:text-foreground">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="font-mono text-[0.7rem] tracking-wide text-muted-foreground">
            © 2026 ShopSense. สงวนลิขสิทธิ์ทุกประการ
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" aria-label="Facebook">
              <FacebookLogo weight="bold" className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Instagram">
              <InstagramLogo weight="bold" className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="X (Twitter)">
              <XLogo weight="bold" className="size-4" />
            </Button>
            <span className="mx-1 h-5 w-px bg-border" aria-hidden />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
