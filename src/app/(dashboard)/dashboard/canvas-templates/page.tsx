import Link from "next/link";
import { revalidatePath } from "next/cache";
import { duplicateTemplate } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

async function duplicateTemplateAction(formData: FormData) {
  "use server";

  const templateId = formData.get("templateId");
  if (!templateId || typeof templateId !== "string") return;
  await duplicateTemplate(templateId);
  revalidatePath("/dashboard/canvas-templates");
}

export default async function CanvasTemplatesPage() {
  const supabase = createSupabaseServerClient();
  const { data: templates } = await supabase
    .from("templates")
    .select("id,name,status,updated_at,canvas_state")
    .not("canvas_state", "is", null)
    .order("updated_at", { ascending: false });

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Canvas Templates</h1>
          <p className="text-slate-600">Freeform canvas templates saved from the main editor.</p>
        </div>
        <Link
          href="/dashboard/canvas-templates/new"
          className="inline-flex items-center justify-center rounded-full bg-[#3F51B5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#35449a]"
        >
          New Canvas Template
        </Link>
      </header>
      {(templates ?? []).length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">No canvas templates yet</h2>
          <p className="max-w-xl text-slate-600">Design your first canvas and save it as a reusable template.</p>
          <Link
            href="/dashboard/canvas-templates/new"
            className="inline-flex items-center justify-center rounded-full bg-[#3F51B5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#35449a]"
          >
            Start a canvas
          </Link>
        </div>
      ) : (
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
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/canvas-templates/${template.id}`}
                        className="rounded-full border border-slate-200 px-4 py-1 text-sm font-medium text-slate-700 hover:border-slate-400"
                      >
                        Open canvas
                      </Link>
                      <form action={duplicateTemplateAction} className="inline-flex" method="post">
                        <input type="hidden" name="templateId" value={template.id} />
                        <Button variant="outline" type="submit">
                          Duplicate
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
