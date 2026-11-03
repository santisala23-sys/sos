import {
  formatCentsAsPesos,
  resolveStoreProductPricing,
} from "@/lib/store/store-pricing";
import { cn } from "@/lib/utils/cn";

type StoreProductPriceProps = {
  price_cents: number | null;
  price_label: string;
  discount_percent?: number | null;
  promoLabel?: string | null;
  className?: string;
  size?: "sm" | "md";
};

export function StoreProductPrice({
  price_cents,
  price_label,
  discount_percent,
  promoLabel,
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
      <div className={cn("space-y-2", className)}>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
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
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-block rounded-full bg-gradient-to-r from-rose-500 to-rose-600 font-bold uppercase tracking-wide text-white shadow-sm",
              size === "sm"
                ? "px-2.5 py-0.5 text-[10px]"
                : "px-3 py-1 text-xs",
            )}
            aria-label={`${pricing.discountPercent} por ciento de descuento`}
          >
            {pricing.discountPercent}% OFF
          </span>
          {promoLabel ? <ProPromoPill label={promoLabel} size={size} /> : null}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <p className={cn(saleClass, "text-neutral-900")}>{pricing.displayLabel}</p>
      {promoLabel ? (
        <div className="mt-2">
          <ProPromoPill label={promoLabel} size={size} />
        </div>
      ) : null}
    </div>
  );
}

function ProPromoPill({
  label,
  size,
}: {
  label: string;
  size: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-full bg-violet-600 font-bold text-white shadow-sm",
        size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
      )}
    >
      {label}
    </span>
  );
}
