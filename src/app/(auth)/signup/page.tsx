"use client";

import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import Link from "next/link";
import { useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function SignupPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-white/70">Create account</p>
        <h2 className="text-3xl font-semibold">Start your workspace</h2>
        <p className="text-sm text-white/70">Accounts map 1:1 with Supabase auth users and profiles.</p>
      </div>
      <Auth
        supabaseClient={supabase}
        providers={["github"]}
        view="sign_up"
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
        Already have access? <Link href="/login" className="font-semibold text-white">Sign in</Link>
      </p>
    </div>
  );
}
