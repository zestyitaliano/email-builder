import { ElementToolbar } from "@/components/email-canvas/element-toolbar";
import { StyleEditor } from "@/components/email-canvas/style-editor";
import { AiSuggestions } from "@/components/email-canvas/ai-suggestions";
import type { CanvasElement, CanvasElementType, Style } from "@/lib/types";

interface SettingsPanelProps {
  elements: CanvasElement[];
  selectedElement: CanvasElement | null;
  onAddElement: (type: CanvasElementType) => void;
  onStyleChange: (style: Partial<Style>, options?: { commit?: boolean }) => void;
  onContentChange: (content: string) => void;
  onElementMetaChange: (id: string, patch: Partial<CanvasElement>, options?: { commit?: boolean }) => void;
  onDeleteElement: (id: string) => void;
  onApplyFonts?: (fonts: string[]) => void;
  onApplyPalette?: (palettes: string[]) => void;
}

export function SettingsPanel({
  elements,
  selectedElement,
  onAddElement,
  onStyleChange,
  onContentChange,
  onElementMetaChange,
  onDeleteElement,
  onApplyFonts,
  onApplyPalette
}: SettingsPanelProps) {
  return (
    <aside className="w-full max-w-sm space-y-4 rounded-4xl bg-[#F1F3FF]/70 p-4">
      <ElementToolbar onAddElement={onAddElement} />
      {selectedElement ? (
        <StyleEditor
          element={selectedElement}
          onStyleChange={onStyleChange}
          onContentChange={onContentChange}
          onElementMetaChange={onElementMetaChange}
          onDelete={() => onDeleteElement(selectedElement.id)}
        />
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-sm text-slate-500">
          Select an element to edit its properties.
        </div>
      )}
      <div className="rounded-3xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Design AI</p>
            <p className="text-sm text-slate-500">Fresh color and font ideas</p>
          </div>
        </div>
        <div className="mt-4">
          <AiSuggestions elements={elements} onApplyFonts={onApplyFonts} onApplyPalette={onApplyPalette} />
        </div>
      </div>
    </aside>
  );
}
