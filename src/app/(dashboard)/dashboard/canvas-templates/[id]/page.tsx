import { notFound, redirect } from "next/navigation";
import { EmailCanvasWorkspace } from "@/components/email-canvas/email-canvas-workspace";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { loadCanvasDocument } from "@/lib/actions";

interface CanvasTemplatePageProps {
  params: { id: string };
}

export default async function CanvasTemplatePage({ params }: CanvasTemplatePageProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  try {
    const doc = await loadCanvasDocument(params.id);
    return <EmailCanvasWorkspace initialDocument={doc} initialTemplateId={params.id} />;
  } catch (error) {
    console.error("Failed to load canvas template", error);
    notFound();
  }
}
