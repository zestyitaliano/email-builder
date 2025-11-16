import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const [{ data: templates }, { data: assets }, { data: profile }] = await Promise.all([
    supabase.from("templates").select("id,name,status,updated_at").order("updated_at", { ascending: false }).limit(3),
    supabase.from("assets").select("id,name,url,created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("profiles").select("id,full_name,company").single()
  ]);

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Welcome</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          {profile?.full_name ?? "Your team"}
        </h1>
        <p className="mt-2 text-slate-600">
          {profile?.company ? `Working inside ${profile.company}.` : "Keep templates and media organized."}
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="Templates" value={templates?.length ?? 0} helper="Last 3 updated" />
          <StatCard label="Assets" value={assets?.length ?? 0} helper="Newest uploads" />
          <StatCard label="Workspace" value={profile?.company ?? "Not set"} helper="Supabase profile" />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ListCard title="Recent templates" empty="No templates yet" items={(templates ?? []).map((template) => ({
          id: template.id,
          title: template.name,
          meta: template.status ?? "draft",
          timestamp: template.updated_at ? new Date(template.updated_at).toLocaleDateString() : ""
        }))} />
        <ListCard title="Latest assets" empty="Upload assets to get started" items={(assets ?? []).map((asset) => ({
          id: asset.id,
          title: asset.name,
          meta: deriveHostname(asset.url),
          timestamp: asset.created_at ? new Date(asset.created_at).toLocaleDateString() : ""
        }))} />
      </section>
    </div>
  );
}

function StatCard({ label, value, helper }: { label: string; value: number | string; helper: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{helper}</p>
    </div>
  );
}

function deriveHostname(url?: string | null) {
  if (!url) return "Storage";
  try {
    return new URL(url).hostname;
  } catch (error) {
    return "Storage";
  }
}

function ListCard({
  title,
  empty,
  items
}: {
  title: string;
  empty: string;
  items: { id: string; title: string; meta?: string | null; timestamp?: string }[];
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="mt-4 space-y-4">
        {items.length === 0 && <p className="text-sm text-slate-500">{empty}</p>}
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
            <p className="font-medium text-slate-900">{item.title}</p>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{item.meta}</p>
            <p className="text-sm text-slate-400">{item.timestamp}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
