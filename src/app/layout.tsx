import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Email Canvas",
  description: "A standalone, canvas-first email builder with Supabase auth",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-[#E8EAF6]">
      <body className={`${inter.variable} min-h-screen bg-[#E8EAF6] font-sans text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
