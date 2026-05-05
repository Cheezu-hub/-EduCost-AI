"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { GraduationCap } from "lucide-react";

const NAV_ITEMS = [
  { href: "/",           label: "1. Setup" },
  { href: "/snapshot",   label: "2. Snapshot" },
  { href: "/risk",       label: "3. Risk" },
  { href: "/simulation", label: "4. Simulate" },
  { href: "/decision",   label: "5. Decide" },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 w-full px-6 py-4 pointer-events-none">
      <nav className="max-w-4xl mx-auto pointer-events-auto">
        <div className="glass border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-2xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white transition-transform group-hover:scale-110 duration-300">
              <GraduationCap size={18} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">
              EduCost <span className="text-blue-600">AI</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                  pathname === item.href
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/80"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
