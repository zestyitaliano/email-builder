import type React from "react";
import { ElementToolbar } from "@/components/email-canvas/element-toolbar";
import { StyleEditor } from "@/components/email-canvas/style-editor";
import { AiSuggestions } from "@/components/email-canvas/ai-suggestions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { CanvasElement, CanvasElementType, CanvasPageSettings, Style } from "@/lib/types";

interface SettingsPanelProps {
  elements: CanvasElement[];
  selectedElement: CanvasElement | null;
  pageSettings: CanvasPageSettings;
  onAddElement: (type: CanvasElementType) => void;
  onStyleChange: (style: Partial<Style>, options?: { commit?: boolean }) => void;
  onContentChange: (content: string) => void;
  onElementMetaChange?: (id: string, patch: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  onApplyFonts?: (fonts: string[]) => void;
  onApplyPalette?: (palettes: string[]) => void;
  onPageSettingsChange: (patch: Partial<CanvasPageSettings>) => void;
}

export function SettingsPanel({
  elements,
  selectedElement,
  pageSettings,
  onAddElement,
  onStyleChange,
  onContentChange,
  onElementMetaChange,
  onDeleteElement,
  onApplyFonts,
  onApplyPalette,
  onPageSettingsChange
}: SettingsPanelProps) {
  const handleHeightModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const mode = event.target.value;
    if (mode === "auto") {
      onPageSettingsChange({ height: "auto" });
    } else {
      onPageSettingsChange({ height: pageSettings.height === "auto" ? 720 : pageSettings.height });
    }
  };

  const handlePageNumberChange = (key: keyof CanvasPageSettings) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (Number.isNaN(value)) return;
    onPageSettingsChange({ [key]: value });
  };

  return (
    <aside className="w-full max-w-sm space-y-4 rounded-4xl bg-[#F1F3FF]/70 p-4">
      <ElementToolbar onAddElement={onAddElement} />
      <div className="space-y-3 rounded-3xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Page</p>
            <p className="text-sm text-slate-500">Layout and background</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500">Width (px)</p>
            <Input type="number" value={Number(pageSettings.width)} onChange={handlePageNumberChange("width")} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Padding (px)</p>
            <Input type="number" value={Number(pageSettings.padding)} onChange={handlePageNumberChange("padding")} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500">Height mode</p>
            <Select value={pageSettings.height === "auto" ? "auto" : "fixed"} onChange={handleHeightModeChange}>
              <option value="auto">Auto</option>
              <option value="fixed">Fixed</option>
            </Select>
          </div>
          {pageSettings.height !== "auto" ? (
            <div>
              <p className="text-xs font-medium text-slate-500">Height (px)</p>
              <Input
                type="number"
                value={Number(pageSettings.height) || 0}
                onChange={handlePageNumberChange("height")}
              />
            </div>
          ) : null}
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Background color</p>
          <Input
            type="color"
            value={String(pageSettings.backgroundColor)}
            onChange={(event) => onPageSettingsChange({ backgroundColor: event.target.value })}
          />
        </div>
      </div>
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
          <AiSuggestions doc={{ elements, page: pageSettings }} onApplyFonts={onApplyFonts} onApplyPalette={onApplyPalette} />
        </div>
      </div>
    </aside>
  );
}
