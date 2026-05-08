import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ClientInit } from "@/components/layout/ClientInit";

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
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#09090b] min-h-screen text-gray-100 relative overflow-x-hidden antialiased`}>
        <ClientInit />
        {/* Premium Dark Background Elements */}
        <div className="fixed inset-0 bg-grid opacity-[0.2] pointer-events-none" />
        <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[150px] rounded-full pointer-events-none" />
        <div className="fixed bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
            {children}
          </main>
          <footer className="py-8 text-center text-sm text-gray-500 border-t border-white/5 bg-black/20 backdrop-blur-md">
            © 2026 EduCost AI • Premium Financial Intelligence.
          </footer>
        </div>
      </body>
    </html>
  );
}
