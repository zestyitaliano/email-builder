import { redirect } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

async function signOutAction() {
  "use server";

  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white/70 px-6 py-4 backdrop-blur">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">dashboard</p>
          <p className="text-xl font-semibold text-slate-900">Email Builder</p>
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <Link href="/dashboard" className="hover:text-slate-900">
            Overview
          </Link>
          <Link href="/dashboard/templates" className="hover:text-slate-900">
            Templates
          </Link>
          <Link href="/dashboard/assets" className="hover:text-slate-900">
            Assets
          </Link>
          <form action={signOutAction}>
            <button className="rounded-full bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700">
              Sign out
            </button>
          </form>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
