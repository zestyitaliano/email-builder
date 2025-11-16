import { notFound } from "next/navigation";
import { EmailCanvasWorkspace } from "@/components/email-canvas/email-canvas-workspace";
import { createBaseCanvasElements } from "@/lib/canvasPresets";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import type { CanvasElement } from "@/lib/types";

interface CanvasTemplatePageProps {
  params: { id: string };
}

export default async function CanvasTemplatePage({ params }: CanvasTemplatePageProps) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("templates")
    .select("id,canvas_state")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    notFound();
  }

  const canvasState = Array.isArray(data.canvas_state) ? (data.canvas_state as CanvasElement[]) : null;
  const initialElements = canvasState && canvasState.length > 0 ? canvasState : createBaseCanvasElements();

  return <EmailCanvasWorkspace initialElements={initialElements} initialTemplateId={data.id} />;
}
