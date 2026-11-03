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
    return (
      <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
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
      </div>
    );
  }

  return (
    <p className={cn(saleClass, "text-neutral-900", className)}>
      {pricing.displayLabel}
    </p>
  );
}
