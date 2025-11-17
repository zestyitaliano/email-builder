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
  onElementMetaChange: (id: string, patch: Partial<CanvasElement>, options?: { commit?: boolean }) => void;
  onDeleteElement: (id: string) => void;
  onApplyFonts?: (fonts: string[]) => void;
  onApplyPalette?: (palettes: string[]) => void;
  onPageSettingsChange: (patch: Partial<CanvasPageSettings>) => void;
  onTokensChange: (patch: Partial<CanvasDesignTokens>) => void;
  onApplyTextStyle: (variant: keyof CanvasDesignTokens["textStyles"]) => void;
  onApplyColorSwatch: (color: string) => void;
  onAddSwatch: () => void;
  onRemoveSwatch: (color: string) => void;
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
  onApplyFonts,
  onApplyPalette,
  onPageSettingsChange,
  onTokensChange,
  onApplyTextStyle,
  onApplyColorSwatch,
  onAddSwatch,
  onRemoveSwatch
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

  const handleTextStyleChange = (
    variant: keyof CanvasDesignTokens["textStyles"],
    key: keyof TextStyle,
    value: string | number
  ) => {
    const current = tokens.textStyles[variant];
    onTokensChange({
      textStyles: {
        ...tokens.textStyles,
        [variant]: { ...current, [key]: value }
      }
    });
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
      <div className="space-y-3 rounded-3xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Typography</p>
            <p className="text-sm text-slate-500">Design tokens for headings and body</p>
          </div>
        </div>
        <div className="space-y-3">
          {(Object.keys(tokens.textStyles) as (keyof CanvasDesignTokens["textStyles"])[]).map((variant) => {
            const style = tokens.textStyles[variant];
            return (
              <div key={variant} className="rounded-2xl border border-slate-100 bg-[#F8F9FF] p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold capitalize text-slate-800">{variant}</p>
                    <p className="text-xs text-slate-500">{style.fontFamily}</p>
                  </div>
                  {selectedElement?.type === "text" ? (
                    <Button size="sm" variant="outline" onClick={() => onApplyTextStyle(variant)}>
                      Apply {variant.toUpperCase()}
                    </Button>
                  ) : null}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Font family</p>
                    <Input
                      type="text"
                      value={style.fontFamily}
                      onChange={(event) => handleTextStyleChange(variant, "fontFamily", event.target.value)}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Font size</p>
                    <Input
                      type="number"
                      value={Number(style.fontSize)}
                      onChange={(event) => handleTextStyleChange(variant, "fontSize", Number(event.target.value))}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Weight</p>
                    <Input
                      type="number"
                      value={Number(style.fontWeight)}
                      onChange={(event) => handleTextStyleChange(variant, "fontWeight", Number(event.target.value))}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Line height</p>
                    <Input
                      type="number"
                      step="0.05"
                      value={Number(style.lineHeight)}
                      onChange={(event) => handleTextStyleChange(variant, "lineHeight", Number(event.target.value))}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Letter spacing</p>
                    <Input
                      type="number"
                      step="0.1"
                      value={Number(style.letterSpacing ?? 0)}
                      onChange={(event) => handleTextStyleChange(variant, "letterSpacing", Number(event.target.value))}
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
            <p className="text-sm text-slate-500">Reusable palette for your canvas</p>
          </div>
          <Button size="sm" variant="outline" onClick={onAddSwatch}>
            Add swatch
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tokens.colorSwatches.map((swatch) => (
            <div
              key={swatch}
              role="button"
              tabIndex={0}
              className="group relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-slate-200"
              onClick={() => onApplyColorSwatch(swatch)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onApplyColorSwatch(swatch);
                }
              }}
              style={{ backgroundColor: swatch }}
              aria-label={`Apply ${swatch}`}
            >
              <span className="sr-only">{swatch}</span>
              <span
                role="button"
                tabIndex={-1}
                className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-700 shadow group-hover:flex"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemoveSwatch(swatch);
                }}
              >
                ×
              </span>
            </div>
          ))}
          {!tokens.colorSwatches.length ? <p className="text-sm text-slate-500">No swatches yet.</p> : null}
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
          <AiSuggestions doc={{ elements, page: pageSettings, tokens }} onApplyFonts={onApplyFonts} onApplyPalette={onApplyPalette} />
        </div>
      </div>
    </aside>
  );
}
