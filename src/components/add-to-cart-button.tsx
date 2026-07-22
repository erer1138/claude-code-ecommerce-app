"use client";

import { useEffect, useState } from "react";
import { Check } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

export function AddToCartButton({ className }: { className?: string }) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(timer);
  }, [added]);

  return (
    <button
      type="button"
      onClick={() => setAdded(true)}
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:underline",
        added && "text-pastel-green-foreground",
        className
      )}
    >
      {added ? (
        <>
          <Check weight="bold" className="size-4 animate-pop" />
          เพิ่มแล้ว
        </>
      ) : (
        "ซื้อเลย"
      )}
    </button>
  );
}
