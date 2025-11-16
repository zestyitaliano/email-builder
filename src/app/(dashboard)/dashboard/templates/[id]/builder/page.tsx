import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import type { BuilderNode } from "@/types/nodes";
import { BuilderClient } from "./BuilderClient";

interface PageProps {
  params: { id: string };
}

export default async function TemplateBuilderPage({ params }: PageProps) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("templates")
    .select("id,name,subject,builder_tree")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    notFound();
  }

  const nodes = (data.builder_tree as BuilderNode[] | null) ?? [];

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Template Builder (Rows)</h1>
        <p className="text-slate-600">Row-based email template editor – optimized for inbox compatibility.</p>
      </header>
      <BuilderClient
        templateId={data.id}
        initialNodes={nodes}
        templateName={data.name}
        templateSubject={data.subject}
      />
    </section>
  );
}
