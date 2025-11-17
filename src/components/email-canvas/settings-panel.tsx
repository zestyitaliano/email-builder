import type React from "react";
import { useMemo, useState } from "react";
import { ElementToolbar } from "@/components/email-canvas/element-toolbar";
import { StyleEditor } from "@/components/email-canvas/style-editor";
import { AiSuggestions } from "@/components/email-canvas/ai-suggestions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type {
  CanvasDesignTokens,
  CanvasElement,
  CanvasElementType,
  CanvasPageSettings,
  Style,
  TextStyle
} from "@/lib/types";

interface SettingsPanelProps {
  elements: CanvasElement[];
  selectedElement: CanvasElement | null;
  pageSettings: CanvasPageSettings;
  tokens: CanvasDesignTokens;
  onAddElement: (type: CanvasElementType) => void;
  onStyleChange: (style: Partial<Style>, options?: { commit?: boolean }) => void;
  onContentChange: (content: string) => void;
  onElementMetaChange?: (id: string, patch: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  onLayerChange?: (id: string, action: "front" | "back" | "forward" | "backward") => void;
  onApplyFonts?: (fonts: string[]) => void;
  onApplyPalette?: (palettes: string[]) => void;
  onPageSettingsChange: (patch: Partial<CanvasPageSettings>) => void;
  onTokensChange: (patch: Partial<CanvasDesignTokens>) => void;
}

export function SettingsPanel({
  elements,
  selectedElement,
  pageSettings,
  tokens,
  onAddElement,
  onStyleChange,
  onContentChange,
  onElementMetaChange,
  onDeleteElement,
  onLayerChange,
  onApplyFonts,
  onApplyPalette,
  onPageSettingsChange,
  onTokensChange
}: SettingsPanelProps) {
  const [customSwatch, setCustomSwatch] = useState("#111827");

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

  const handleTextStyleChange = (
    styleKey: keyof CanvasDesignTokens["textStyles"],
    key: keyof TextStyle,
    value: string | number
  ) => {
    const updatedStyle: TextStyle = {
      ...tokens.textStyles[styleKey],
      [key]: typeof tokens.textStyles[styleKey][key] === "number" ? Number(value) : value
    } as TextStyle;
    onTokensChange({
      textStyles: {
        ...tokens.textStyles,
        [styleKey]: updatedStyle
      }
    });
  };

  const applyTextToken = (styleKey: keyof CanvasDesignTokens["textStyles"]) => {
    if (!selectedElement || selectedElement.type !== "text") return;
    const ts = tokens.textStyles[styleKey];
    onStyleChange(
      {
        fontFamily: ts.fontFamily,
        fontSize: ts.fontSize,
        fontWeight: ts.fontWeight,
        lineHeight: ts.lineHeight
      },
      { commit: true }
    );
  };

  const applySwatch = (hex: string) => {
    if (!selectedElement) return;
    if (selectedElement.type === "text") {
      onStyleChange({ color: hex }, { commit: true });
      return;
    }
    onStyleChange({ backgroundColor: hex }, { commit: true });
  };

  const addSwatch = () => {
    let newHex = "";
    if (selectedElement) {
      if (selectedElement.type === "text" && selectedElement.styles.color) {
        newHex = String(selectedElement.styles.color);
      } else if (selectedElement.styles.backgroundColor) {
        newHex = String(selectedElement.styles.backgroundColor);
      }
    }

    if (!newHex) {
      newHex = customSwatch.trim();
    }

    if (!newHex) return;

    if (tokens.colorSwatches.includes(newHex)) return;

    onTokensChange({ colorSwatches: [...tokens.colorSwatches, newHex] });
  };

  const removeSwatch = (hex: string) => {
    const filtered = tokens.colorSwatches.filter((color) => color !== hex);
    onTokensChange({ colorSwatches: filtered });
  };

  const hasSelectedColor = useMemo(() => {
    if (!selectedElement) return false;
    if (selectedElement.type === "text") {
      return Boolean(selectedElement.styles.color);
    }
    return Boolean(selectedElement.styles.backgroundColor);
  }, [selectedElement]);

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
      <div className="space-y-4 rounded-3xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Typography</p>
            <p className="text-sm text-slate-500">Document text styles</p>
          </div>
          {selectedElement?.type === "text" ? (
            <div className="flex gap-2">
              {(["h1", "h2", "body"] as (keyof CanvasDesignTokens["textStyles"])[]).map((key) => (
                <Button key={key} size="sm" variant="outline" onClick={() => applyTextToken(key)}>
                  Apply {key.toUpperCase()}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="space-y-4">
          {(["h1", "h2", "body"] as (keyof CanvasDesignTokens["textStyles"])[]).map((styleKey) => {
            const style = tokens.textStyles[styleKey];
            return (
              <div key={styleKey} className="rounded-2xl border border-slate-100 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">{styleKey}</p>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-slate-500">Font family</p>
                    <Input
                      value={style.fontFamily}
                      onChange={(event) => handleTextStyleChange(styleKey, "fontFamily", event.target.value)}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Font size</p>
                    <Input
                      type="number"
                      value={Number(style.fontSize)}
                      onChange={(event) => handleTextStyleChange(styleKey, "fontSize", Number(event.target.value))}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Font weight</p>
                    <Input
                      type="number"
                      value={Number(style.fontWeight)}
                      onChange={(event) => handleTextStyleChange(styleKey, "fontWeight", Number(event.target.value))}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Line height</p>
                    <Input
                      type="number"
                      step={0.05}
                      value={Number(style.lineHeight)}
                      onChange={(event) => handleTextStyleChange(styleKey, "lineHeight", Number(event.target.value))}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="space-y-3 rounded-3xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Color swatches</p>
            <p className="text-sm text-slate-500">Save and reuse colors</p>
          </div>
        </div>
        <div className="grid grid-cols-6 gap-3">
          {tokens.colorSwatches.map((hex) => (
            <div key={hex} className="relative flex items-center justify-center">
              <button
                type="button"
                className="h-9 w-9 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: hex }}
                onClick={() => applySwatch(hex)}
                aria-label={`Apply swatch ${hex}`}
              />
              <button
                type="button"
                className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-white text-[10px] text-slate-600 shadow"
                onClick={() => removeSwatch(hex)}
                aria-label={`Remove swatch ${hex}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-3">
            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span>Add swatch</span>
              <span className="text-[11px] text-slate-500">{hasSelectedColor ? "From selection" : "Custom"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={customSwatch}
                onChange={(event) => setCustomSwatch(event.target.value)}
                placeholder="#000000"
              />
              <Button type="button" variant="outline" onClick={addSwatch}>
                Add
              </Button>
            </div>
            <p className="text-[11px] text-slate-500">
              {hasSelectedColor
                ? "We'll use the selected element color if available, otherwise the custom hex."
                : "Enter a hex value if no element color is selected."}
            </p>
          </div>
        </div>
      </div>
      {selectedElement ? (
        <StyleEditor
          element={selectedElement}
          onStyleChange={onStyleChange}
          onContentChange={onContentChange}
          onElementMetaChange={onElementMetaChange}
          onLayerChange={onLayerChange}
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
          <AiSuggestions
            doc={{ elements, page: pageSettings, tokens }}
            onApplyFonts={onApplyFonts}
            onApplyPalette={onApplyPalette}
          />
        </div>
      </div>
    </aside>
  );
}
