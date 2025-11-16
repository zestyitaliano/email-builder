import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function CanvasTemplatesPage() {
  const supabase = createSupabaseServerClient();
  const { data: templates } = await supabase
    .from("templates")
    .select("id,name,status,updated_at,canvas_state")
    .not("canvas_state", "is", null)
    .order("updated_at", { ascending: false });

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900">Canvas templates</h1>
        <p className="text-slate-600">Saved designs that originated from the freeform Email Canvas.</p>
      </header>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.3em] text-slate-500">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Updated</th>
              <th className="px-6 py-3" aria-label="Actions" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(templates ?? []).map((template) => (
              <tr key={template.id} className="text-slate-700">
                <td className="px-6 py-4 font-medium">{template.name ?? "Canvas template"}</td>
                <td className="px-6 py-4 capitalize">{template.status ?? "draft"}</td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {template.updated_at ? new Date(template.updated_at).toLocaleString() : "--"}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/dashboard/canvas-templates/${template.id}`}
                    className="rounded-full border border-slate-200 px-4 py-1 text-sm font-medium text-slate-700 hover:border-slate-400"
                  >
                    Open canvas
                  </Link>
                </td>
              </tr>
            ))}
            {(templates ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                  No canvas-based templates have been saved yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
