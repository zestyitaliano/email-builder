import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-24 text-center">
      <div className="max-w-3xl space-y-6">
        <p className="inline-flex items-center rounded-full border border-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/70">
          Supabase Powered Email Builder
        </p>
        <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
          Launch templates faster with a secure dashboard.
        </h1>
        <p className="text-base text-white/80 sm:text-lg">
          Bring your team and assets together in a collaborative builder. Sign in to create
          brand profiles, craft email templates, and manage reusable media from the same Supabase-backed workspace.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="rounded-full bg-white px-6 py-3 text-center font-semibold text-slate-900 transition hover:opacity-90"
          >
            Get Started
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/30 px-6 py-3 text-center font-semibold text-white transition hover:border-white"
          >
            View Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
