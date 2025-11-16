import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-slate-950 text-white lg:grid-cols-2">
      <section className="flex flex-col justify-between gap-12 bg-gradient-to-b from-brand-700 to-slate-900 p-10 text-left">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.35em] text-white/70">email builder</p>
          <h1 className="text-4xl font-semibold leading-tight">
            Craft professional email journeys powered by Supabase auth.
          </h1>
          <p className="text-base text-white/80">
            Securely invite teammates, organize brand profiles, and ship templates while Supabase keeps
            sessions and data locked to the current workspace.
          </p>
        </div>
        <div className="space-x-4 text-sm text-white/70">
          <Link href="/">Home</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>
      </section>
      <section className="flex items-center justify-center bg-slate-950 p-8">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/50 p-8 shadow-2xl">
          {children}
        </div>
      </section>
    </main>
  );
}
