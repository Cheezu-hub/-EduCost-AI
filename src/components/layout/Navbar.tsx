"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { GraduationCap, LogOut, User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { motion } from "framer-motion";

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
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 py-4 pointer-events-none">
      <nav className="max-w-5xl mx-auto pointer-events-auto">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="glass shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-2xl px-4 sm:px-6 h-16 flex items-center justify-between"
        >
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-110 duration-300">
              <GraduationCap size={20} strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-white text-xl tracking-tight hidden sm:block">
              EduCost <span className="text-cyan-400">AI</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1 relative">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={`Go to ${item.label}`}
                  className={cn(
                    "relative px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-300",
                    isActive ? "text-white" : "text-gray-400 hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-white/10 rounded-xl"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Auth Controls */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                  <User size={14} className="text-cyan-400" />
                  <span className="text-xs font-semibold text-gray-200 max-w-[100px] truncate">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-rose-400 hover:bg-rose-400/10 transition-all duration-300"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 hover:scale-105"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </nav>
    </header>
  );
}
