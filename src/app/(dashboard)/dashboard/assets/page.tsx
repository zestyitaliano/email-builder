import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function AssetsPage() {
  const supabase = createSupabaseServerClient();
  const { data: assets } = await supabase
    .from("assets")
    .select("id,name,url,created_at")
    .order("created_at", { ascending: false });

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900">Assets</h1>
        <p className="text-slate-600">
          Files are saved to the Supabase storage bucket <code className="rounded bg-slate-100 px-2 py-1">assets</code>.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(assets ?? []).map((asset) => (
          <div key={asset.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="aspect-video overflow-hidden rounded-2xl bg-slate-100">
              {asset.url ? (
                <Image
                  src={asset.url}
                  alt={asset.name}
                  width={400}
                  height={250}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">Pending upload</div>
              )}
            </div>
            <div className="mt-3">
              <p className="font-medium text-slate-900">{asset.name}</p>
              <p className="text-sm text-slate-500">
                {asset.created_at ? new Date(asset.created_at).toLocaleString() : "--"}
              </p>
            </div>
          </div>
        ))}
        {(assets ?? []).length === 0 && (
          <p className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-sm text-slate-500">
            Upload PNG/JPG/WEBP files using the Supabase dashboard or Storage API. RLS ensures only owners can write.
          </p>
        )}
      </div>
    </section>
  );
}
