import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Email Builder",
  description: "Supabase authenticated email template builder"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-slate-950">
      <body className="min-h-screen font-sans antialiased text-slate-100">
        {children}
      </body>
    </html>
  );
}
