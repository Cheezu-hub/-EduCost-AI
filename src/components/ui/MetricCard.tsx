"use client";

import { cn } from "@/lib/utils";
import { DollarSign, Clock, AlertCircle, TrendingUp } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  className?: string;
  type?: "cost" | "loan" | "emi" | "salary";
}

const icons = {
  cost:   <DollarSign className="w-4 h-4 text-blue-600" />,
  loan:   <AlertCircle className="w-4 h-4 text-amber-600" />,
  emi:    <Clock className="w-4 h-4 text-indigo-600" />,
  salary: <TrendingUp className="w-4 h-4 text-emerald-600" />,
};

export function MetricCard({ label, value, sub, highlight, className, type }: MetricCardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-gray-200/60 rounded-2xl p-6 flex flex-col gap-3 transition-all duration-300 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 group",
        highlight && "bg-blue-50/50 border-blue-200",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        {type && (
          <div className={cn(
            "p-2 rounded-lg transition-colors",
            highlight ? "bg-blue-100" : "bg-gray-50 group-hover:bg-blue-50"
          )}>
            {icons[type]}
          </div>
        )}
      </div>
      <div>
        <p className={cn(
          "text-3xl font-bold tracking-tight text-gray-900",
          highlight && "text-blue-700"
        )}>
          {value}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-1 font-medium">{sub}</p>}
      </div>
    </div>
  );
}
