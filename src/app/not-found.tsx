import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="font-mono text-xs tracking-[0.15em] text-muted-foreground uppercase">
        404
      </p>
      <h1 className="font-heading text-3xl font-medium tracking-tight text-foreground">
        ไม่พบหน้าที่คุณต้องการ
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        หน้าที่คุณค้นหาอาจถูกย้ายหรือไม่มีอยู่จริง
      </p>
      <div className="mt-2 flex items-center gap-6">
        <Link
          href="/"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors duration-300 ease-out hover:bg-foreground/80"
        >
          กลับหน้าหลัก
        </Link>
        <Link
          href="/products"
          className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
        >
          ดูสินค้าทั้งหมด
        </Link>
      </div>
    </div>
  );
}
