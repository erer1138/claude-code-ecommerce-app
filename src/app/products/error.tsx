"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ProductsError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[products] page error:", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6 lg:px-8">
      <h1 className="font-heading text-2xl font-medium tracking-tight text-foreground">
        เกิดข้อผิดพลาดชั่วคราว
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        ไม่สามารถโหลดข้อมูลสินค้าได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง
      </p>
      <div className="mt-2 flex items-center gap-4">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors duration-300 ease-out hover:bg-foreground/80"
        >
          ลองใหม่
        </button>
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
        >
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}
