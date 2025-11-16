"use client";

import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import Link from "next/link";
import { useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-white/70">welcome back</p>
        <h2 className="text-3xl font-semibold">Sign in to continue</h2>
        <p className="text-sm text-white/70">
          Use email magic links or OAuth providers you enabled in Supabase.
        </p>
      </div>
      <Auth
        supabaseClient={supabase}
        providers={["github"]}
        appearance={{
          theme: ThemeSupa,
          style: {
            button: { borderRadius: 9999, fontWeight: 600 },
            input: { borderRadius: 12, background: "#0f172a" }
          },
          className: {
            container: "space-y-4",
            button: "bg-brand-600 hover:bg-brand-500",
            label: "text-white"
          }
        }}
        theme="dark"
      />
      <p className="text-center text-sm text-white/60">
        Need an account? <Link href="/signup" className="font-semibold text-white">Create one</Link>
      </p>
    </div>
  );
}
