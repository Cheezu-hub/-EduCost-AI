"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { GraduationCap, LogOut, User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const NAV_ITEMS = [
  { href: "/",           label: "1. Setup" },
  { href: "/snapshot",   label: "2. Snapshot" },
  { href: "/risk",       label: "3. Risk" },
  { href: "/simulation", label: "4. Simulate" },
  { href: "/decision",   label: "5. Decide" },
  { href: "/ai",         label: "✦ AI Advisor" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full px-6 py-4 pointer-events-none">
      <nav className="max-w-5xl mx-auto pointer-events-auto">
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
                aria-label={`Go to ${item.label}`}
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

          {/* Auth Controls */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl">
                  <User size={14} className="text-blue-600" />
                  <span className="text-xs font-semibold text-gray-700 max-w-[100px] truncate">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50/80 transition-all duration-200"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all duration-200"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
