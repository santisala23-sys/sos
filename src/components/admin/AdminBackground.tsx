type AdminBackgroundProps = {
  children: React.ReactNode;
};

export function AdminBackground({ children }: AdminBackgroundProps) {
  return (
    <div className="relative min-h-dvh bg-[#eef0f8] text-neutral-900">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-violet-300/25 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[24rem] w-[24rem] rounded-full bg-indigo-200/30 blur-3xl" />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(91 33 182 / 0.06) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>
      {children}
    </div>
  );
}
