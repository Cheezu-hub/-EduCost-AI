"use client";

import { cn } from "@/lib/utils";

interface InsightCardProps {
  title: string;
  body: string;
  variant?: "default" | "warning" | "info";
}

const variants = {
  default: "bg-white border-gray-200",
  warning: "bg-red-50 border-red-200",
  info:    "bg-blue-50 border-blue-200",
};

const titleVariants = {
  default: "text-gray-800",
  warning: "text-red-700",
  info:    "text-blue-700",
};

export function InsightCard({ title, body, variant = "default" }: InsightCardProps) {
  return (
    <div className={cn("border rounded-xl p-5", variants[variant])}>
      <p className={cn("font-semibold text-sm mb-1", titleVariants[variant])}>{title}</p>
      <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
    </div>
  );
}
