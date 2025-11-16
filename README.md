# Email Builder

Standalone Next.js + Supabase email builder with a canvas-first editor and an optional row-based template builder. Public auth routes live under `app/(auth)` and the Supabase-protected dashboard lives under `app/(dashboard)`.

## Getting started

1. Install dependencies (the CI environment here cannot reach npm, but locally you can run `npm install`).
2. Duplicate `.env.local` and provide your Supabase project URL + anon key.
3. Start the dev server with `npm run dev`.

## Supabase configuration

1. In the SQL editor paste the contents of [`supabase.sql`](./supabase.sql). It creates the `profiles`, `templates`, and `assets` tables plus row-level security policies.
2. Enable Storage and run the bucket snippet at the bottom of the SQL file to create the public `assets` bucket with RLS that allows public reads but restricts writes to the authenticated owner.
3. In Authentication → Providers enable the OAuth providers you plan to use (the UI defaults to GitHub but you can customize).

## Project structure

```
app/
  (auth)/              // Public auth UI (login + signup) rendered with @supabase/auth-ui-react
  (dashboard)/         // Server components that gate every route behind Supabase auth
  layout.tsx           // Global layout & styles (Tailwind)
  page.tsx             // Canvas-first email editor (main experience)
lib/
  supabaseClient.ts    // Browser helpers powered by createBrowserClient
  supabaseServer.ts    // Server helper consumed inside layouts/actions
supabase.sql           // Tables, policies, and storage helpers
```

The dashboard layout calls `createSupabaseServerClient()` to fetch the active session and will redirect unauthenticated visitors back to `/login`. Any server action can reuse the helper to read/write data while respecting Supabase cookies.

## Styling & linting

Tailwind CSS is preconfigured via `tailwind.config.ts`, and ESLint uses the `next` config. Run `npm run lint` to validate coding style once dependencies are installed locally.
