import { cn } from "@/lib/utils/cn";

type HamburgerButtonProps = {
  open: boolean;
  onClick: () => void;
  className?: string;
  controls?: string;
  "aria-label"?: string;
};

export function HamburgerButton({
  open,
  onClick,
  className,
  controls,
  "aria-label": ariaLabel = open ? "Cerrar menú" : "Abrir menú",
}: HamburgerButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-200/80 bg-white text-violet-700 shadow-sm transition-[background-color,box-shadow] duration-150 hover:bg-violet-50 active:scale-[0.97]",
        open && "border-violet-300 bg-violet-50 shadow-md shadow-violet-500/10",
        className,
      )}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <span className="relative h-4 w-5" aria-hidden>
        <span
          className={cn(
            "absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-transform duration-150 ease-out",
            open ? "top-[7px] rotate-45" : "top-0",
          )}
        />
        <span
          className={cn(
            "absolute left-0 top-[7px] block h-0.5 w-5 rounded-full bg-current transition-all duration-150 ease-out",
            open ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100",
          )}
        />
        <span
          className={cn(
            "absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-transform duration-150 ease-out",
            open ? "top-[7px] -rotate-45" : "top-[14px]",
          )}
        />
      </span>
    </button>
  );
}
