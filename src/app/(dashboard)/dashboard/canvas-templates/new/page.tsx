import { EmailCanvasWorkspace } from "@/components/email-canvas/email-canvas-workspace";
import { createBaseCanvasElements } from "@/lib/canvasPresets";

export default function NewCanvasTemplatePage() {
  const initialElements = createBaseCanvasElements();

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">New Canvas Template</h1>
        <p className="text-slate-600">Start a fresh canvas from the dashboard with the same tools as the main editor.</p>
      </header>
      <EmailCanvasWorkspace initialElements={initialElements} initialTemplateId={null} />
    </section>
  );
}
