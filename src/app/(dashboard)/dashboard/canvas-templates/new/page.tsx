import { redirect } from "next/navigation";
import { EmailCanvasWorkspace } from "@/components/email-canvas/email-canvas-workspace";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createDefaultCanvasDocument } from "@/lib/types";
import { createBaseCanvasElements } from "@/lib/canvasPresets";

export default async function NewCanvasTemplatePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const doc = createDefaultCanvasDocument();
  doc.elements = createBaseCanvasElements();

  return <EmailCanvasWorkspace initialDocument={doc} initialTemplateId={null} />;
}
