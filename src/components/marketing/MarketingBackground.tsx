type MarketingBackgroundProps = {
  children: React.ReactNode;
};

export function MarketingBackground({ children }: MarketingBackgroundProps) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#f6f4fb] text-neutral-900">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -left-48 top-0 h-[32rem] w-[32rem] rounded-full bg-violet-300/35 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-[28rem] w-[28rem] rounded-full bg-indigo-200/45 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-rose-200/35 blur-3xl" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(139 92 246 / 0.07) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>
      {children}
    </div>
  );
}
