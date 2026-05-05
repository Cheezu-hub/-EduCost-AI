"use client";

import { cn } from "@/lib/utils";

interface StepperProps {
  steps: string[];
  current: number;
}

export function Stepper({ steps, current }: StepperProps) {
  return (
    <div className="flex items-center gap-0 w-full mb-8">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-shrink-0">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2",
                i < current
                  ? "bg-blue-600 border-blue-600 text-white"
                  : i === current
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-gray-300 text-gray-400 bg-white"
              )}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span
              className={cn(
                "text-xs mt-1 text-center w-20 leading-tight",
                i === current ? "text-blue-600 font-semibold" : "text-gray-400"
              )}
            >
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "h-0.5 flex-1 mx-1 mt-[-14px]",
                i < current ? "bg-blue-600" : "bg-gray-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
