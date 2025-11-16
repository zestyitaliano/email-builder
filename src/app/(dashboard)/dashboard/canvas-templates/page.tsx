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
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Canvas templates</h1>
          <p className="text-sm text-slate-600">
            Saved canvas-based email layouts you can reuse and refine.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/canvas-templates/new">New canvas template</Link>
        </Button>
      </header>
      {(templates ?? []).length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-8 py-12 text-center">
          <h2 className="text-lg font-semibold text-slate-900">No canvas templates yet</h2>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            Start designing in the canvas and save your favorite layouts as reusable templates.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard/canvas-templates/new">Create your first canvas template</Link>
          </Button>
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
