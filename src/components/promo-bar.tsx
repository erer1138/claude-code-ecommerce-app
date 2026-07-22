import Link from "next/link";

export function PromoBar() {
  return (
    <div className="hidden border-b border-border/60 bg-secondary/40 sm:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs text-muted-foreground sm:px-6 lg:px-8">
        <p>ส่งฟรีทุกออเดอร์เมื่อซื้อครบ 1,500 บาทขึ้นไป</p>
        <div className="flex items-center gap-4">
          <Link href="#" className="hover:text-foreground">
            ติดตามคำสั่งซื้อ
          </Link>
          <Link href="#" className="hover:text-foreground">
            ช่วยเหลือ
          </Link>
        </div>
      </div>
    </div>
  );
}
