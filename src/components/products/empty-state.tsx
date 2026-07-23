import Link from "next/link";

import type { ProductsEmptyState } from "@/lib/products/empty-state";

export function EmptyState({ state }: { state: ProductsEmptyState }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-8 py-16 text-center">
      <p className="text-base font-medium text-foreground">{state.message}</p>
      <Link
        href={state.actionHref}
        className="text-sm font-medium text-foreground underline underline-offset-4 hover:no-underline"
      >
        {state.actionLabel}
      </Link>
    </div>
  );
}
