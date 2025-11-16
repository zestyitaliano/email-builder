import { EmailCanvasWorkspace } from "@/components/email-canvas/email-canvas-workspace";
import { createBaseCanvasElements } from "@/lib/canvasPresets";

export default function HomePage() {
  const initialElements = createBaseCanvasElements();

  return (
    <EmailCanvasWorkspace initialElements={initialElements} initialTemplateId={null} />
  );
}
