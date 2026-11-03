import {
  formatCentsAsPesos,
  resolveStoreProductPricing,
} from "@/lib/store/store-pricing";
import { cn } from "@/lib/utils/cn";

type StoreProductPriceProps = {
  price_cents: number | null;
  price_label: string;
  discount_percent?: number | null;
  className?: string;
  size?: "sm" | "md";
};

export function StoreProductPrice({
  price_cents,
  price_label,
  discount_percent,
  className,
  size = "md",
}: StoreProductPriceProps) {
  const pricing = resolveStoreProductPricing({
    price_cents,
    price_label,
    discount_percent,
  });

  const saleClass =
    size === "sm" ? "text-sm font-semibold" : "text-lg font-bold tabular-nums";

  if (!pricing.hasNumericPrice) {
    return (
      <p className={cn(saleClass, "text-neutral-900", className)}>
        {pricing.displayLabel}
      </p>
    );
  }

  if (pricing.discountPercent > 0 && pricing.originalCents != null) {
    const badgeSize =
      size === "sm" ? "h-8 w-8 text-[10px]" : "h-9 w-9 text-[11px]";
    return (
      <div
        className={cn("flex flex-wrap items-center gap-x-2.5 gap-y-1", className)}
      >
        <span
          className={cn(
            "tabular-nums text-neutral-400 line-through",
            size === "sm" ? "text-xs" : "text-sm",
          )}
        >
          {formatCentsAsPesos(pricing.originalCents)}
        </span>
        <span className={cn(saleClass, "text-violet-800")}>
          {formatCentsAsPesos(pricing.saleCents!)}
        </span>
        <span
          className={cn(
            "inline-flex shrink-0 flex-col items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-600 font-black leading-none text-white shadow-sm ring-2 ring-rose-100",
            badgeSize,
          )}
          aria-label={`${pricing.discountPercent} por ciento de descuento`}
        >
          <span className="opacity-90">−</span>
          <span className="tabular-nums">{pricing.discountPercent}%</span>
        </span>
      </div>
    );
  }

  return (
    <p className={cn(saleClass, "text-neutral-900", className)}>
      {pricing.displayLabel}
    </p>
  );
}
