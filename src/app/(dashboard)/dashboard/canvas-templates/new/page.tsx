import { redirect } from "next/navigation";
import { EmailCanvasWorkspace } from "@/components/email-canvas/email-canvas-workspace";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function NewCanvasTemplatePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <EmailCanvasWorkspace initialTemplateId={null} />;
}
