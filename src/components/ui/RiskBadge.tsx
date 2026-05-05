"use client";

import { cn } from "@/lib/utils";

type Risk = "Safe" | "Moderate" | "Risky";

const riskConfig: Record<Risk, { bg: string; text: string; dot: string }> = {
  Safe:     { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500" },
  Moderate: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
  Risky:    { bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500" },
};

export function RiskBadge({ level, large }: { level: Risk; large?: boolean }) {
  const cfg = riskConfig[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full font-semibold",
        cfg.bg, cfg.text,
        large ? "px-5 py-2 text-base" : "px-3 py-1 text-sm"
      )}
    >
      <span className={cn("rounded-full", cfg.dot, large ? "w-3 h-3" : "w-2 h-2")} />
      {level}
    </span>
  );
}
