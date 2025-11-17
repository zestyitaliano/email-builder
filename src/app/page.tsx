import { EmailCanvasWorkspace } from "@/components/email-canvas/email-canvas-workspace";
import { createBaseCanvasElements } from "@/lib/canvasPresets";
import { createDefaultCanvasDocument } from "@/lib/types";

export default function HomePage() {
  const doc = createDefaultCanvasDocument(createBaseCanvasElements());
  return (
    <EmailCanvasWorkspace initialDocument={doc} initialTemplateId={null} />
  );
}
