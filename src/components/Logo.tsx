"use client";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const box = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const text = size === "sm" ? "text-sm" : "text-base";

  return (
    <div className="flex items-center gap-3">
      <div className={`${box} relative overflow-hidden rounded-xl border border-cyan-300/45 bg-slate-950/85`}>
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/45 to-blue-400/40" />
        <div className="absolute inset-[1px] rounded-[10px] bg-slate-950/95" />
        <svg viewBox="0 0 24 24" className="relative z-10 h-full w-full p-1.5 text-cyan-200">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 3h8l4 4v14H7V3zm8 0v4h4M10 13h4m-4 3h4"
          />
        </svg>
      </div>
      {size !== "sm" && (
        <span className={`${text} font-black uppercase tracking-[0.14em] text-slate-100`}>
          PDF Vault
        </span>
      )}
    </div>
  );
}
