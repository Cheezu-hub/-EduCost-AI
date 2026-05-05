import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduCost AI – Understand Your Education Costs",
  description:
    "Understand education costs, loan burden, and financial risk with clarity. Make smarter decisions about your college investment.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen text-gray-900 relative overflow-x-hidden`}>
        {/* Decorative Background Elements to fill empty space */}
        <div className="fixed inset-0 bg-grid opacity-[0.4] pointer-events-none" />
        <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 blur-[120px] rounded-full pointer-events-none" />
        <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/30 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
            {children}
          </main>
          <footer className="py-8 text-center text-sm text-gray-400 border-t border-gray-100/50 bg-white/50 backdrop-blur-sm">
            © 2026 EduCost AI • Simple. Clear. Human.
          </footer>
        </div>
      </body>
    </html>
  );
}
