import { useRef } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { CanvasElement, Style } from "@/lib/types";

interface StyleEditorProps {
  element: CanvasElement;
  onStyleChange: (style: Partial<Style>, options?: { commit?: boolean }) => void;
  onContentChange: (content: string) => void;
  onElementMetaChange?: (id: string, patch: Partial<CanvasElement>) => void;
  onDelete: () => void;
}

const fontFamilies = ["Inter", "Roboto", "Lato", "Playfair Display", "Space Grotesk"];

export function StyleEditor({ element, onStyleChange, onContentChange, onElementMetaChange, onDelete }: StyleEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleNumberChange = (key: keyof Style) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (Number.isNaN(value)) return;
    onStyleChange({ [key]: value }, { commit: false });
  };

  const handleNumberBlur = (key: keyof Style) => (event: React.FocusEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (Number.isNaN(value)) return;
    onStyleChange({ [key]: value }, { commit: true });
  };

  const handleColorChange = (key: keyof Style) => (event: React.ChangeEvent<HTMLInputElement>) => {
    onStyleChange({ [key]: event.target.value }, { commit: true });
  };

  const handleSelectChange = (key: keyof Style) => (event: React.ChangeEvent<HTMLSelectElement>) => {
    onStyleChange({ [key]: event.target.value }, { commit: true });
  };

  const handleSliderChange = (key: keyof Style) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    onStyleChange({ [key]: value }, { commit: false });
  };

  const handleSliderCommit = (key: keyof Style) => (value: number) => {
    onStyleChange({ [key]: value }, { commit: true });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onStyleChange({ src: reader.result }, { commit: true });
        onElementMetaChange?.(element.id, { imageUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <div className="space-y-4 rounded-3xl bg-white p-4 shadow-sm">
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Content</label>
        <textarea
          className="min-h-[80px] w-full rounded-2xl border border-slate-200 bg-[#F8F9FF] p-3 text-sm text-slate-900 focus:border-[#3F51B5] focus:outline-none"
          value={element.content}
          onChange={(event) => onContentChange(event.target.value)}
          onBlur={(event) => onContentChange(event.target.value)}
        />
      </div>
      <Accordion defaultValue="layout" className="space-y-3">
        <AccordionItem value="layout">
          <AccordionTrigger value="layout">Layout</AccordionTrigger>
          <AccordionContent value="layout" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {(["top", "left", "width", "height"] as (keyof Style)[]).map((key) => (
                <div key={key}>
                  <p className="text-xs font-medium text-slate-500 capitalize">{key}</p>
                  <Input
                    type="number"
                    value={Number(element.styles[key] ?? 0)}
                    onChange={handleNumberChange(key)}
                    onBlur={handleNumberBlur(key)}
                  />
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="typography">
          <AccordionTrigger value="typography">Typography</AccordionTrigger>
          <AccordionContent value="typography" className="space-y-3">
            {element.type === "text" ? (
              <>
                <div>
                  <p className="text-xs font-medium text-slate-500">Font family</p>
                  <Select value={String(element.styles.fontFamily ?? "Inter")} onChange={handleSelectChange("fontFamily")}>
                    {fontFamilies.map((family) => (
                      <option key={family} value={family}>
                        {family}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Font size</p>
                  <Slider
                    min={12}
                    max={48}
                    value={Number(element.styles.fontSize ?? 18)}
                    onChange={handleSliderChange("fontSize")}
                    onMouseUp={(event) => handleSliderCommit("fontSize")(Number(event.currentTarget.value))}
                    onTouchEnd={(event) => handleSliderCommit("fontSize")(Number(event.currentTarget.value))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Weight</p>
                    <Select value={String(element.styles.fontWeight ?? 500)} onChange={handleSelectChange("fontWeight")}>
                      {[400, 500, 600, 700].map((weight) => (
                        <option key={weight} value={weight}>
                          {weight}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Align</p>
                    <Select value={String(element.styles.textAlign ?? "left")} onChange={handleSelectChange("textAlign")}>
                      {(["left", "center", "right"] as const).map((align) => (
                        <option key={align} value={align}>
                          {align}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">Typography settings are available for text elements.</p>
            )}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="colors">
          <AccordionTrigger value="colors">Colors</AccordionTrigger>
          <AccordionContent value="colors" className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500">Text</p>
                <Input type="color" value={String(element.styles.color ?? "#111827")} onChange={handleColorChange("color")} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Background</p>
                <Input
                  type="color"
                  value={String(element.styles.backgroundColor ?? "#ffffff")}
                  onChange={handleColorChange("backgroundColor")}
                />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Border</p>
                <Input
                  type="color"
                  value={String(element.styles.borderColor ?? "#d1d5db")}
                  onChange={handleColorChange("borderColor")}
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Border radius</p>
              <Slider
                min={0}
                max={48}
                value={Number(element.styles.borderRadius ?? 0)}
                onChange={handleSliderChange("borderRadius")}
                onMouseUp={(event) => handleSliderCommit("borderRadius")(Number(event.currentTarget.value))}
                onTouchEnd={(event) => handleSliderCommit("borderRadius")(Number(event.currentTarget.value))}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
        {element.type === "image" ? (
          <AccordionItem value="image">
            <AccordionTrigger value="image">Image</AccordionTrigger>
            <AccordionContent value="image" className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500">Image URL</p>
                <Input
                  type="text"
                  value={element.imageUrl ?? String(element.styles.src ?? "")}
                  onChange={(event) => {
                    const value = event.target.value;
                    onStyleChange({ src: value }, { commit: false });
                    onElementMetaChange?.(element.id, { imageUrl: value });
                  }}
                  onBlur={(event) => {
                    const value = event.target.value;
                    onStyleChange({ src: value }, { commit: true });
                    onElementMetaChange?.(element.id, { imageUrl: value });
                  }}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button type="button" variant="secondary" className="w-full" onClick={() => fileInputRef.current?.click()}>
                  Upload image
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ) : null}
        {element.type === "button" ? (
          <AccordionItem value="button">
            <AccordionTrigger value="button">Button</AccordionTrigger>
            <AccordionContent value="button" className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500">Link URL</p>
                <Input
                  type="text"
                  value={element.linkUrl ?? ""}
                  onChange={(event) => onElementMetaChange?.(element.id, { linkUrl: event.target.value })}
                  onBlur={(event) => onElementMetaChange?.(element.id, { linkUrl: event.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-[#3F51B5] focus:ring-0"
                  checked={Boolean(element.openInNewTab)}
                  onChange={(event) => onElementMetaChange?.(element.id, { openInNewTab: event.target.checked })}
                />
                Open in new tab
              </label>
            </AccordionContent>
          </AccordionItem>
        ) : null}
      </Accordion>
      <Button variant="danger" className="w-full" onClick={onDelete}>
        Delete element
      </Button>
    </div>
  );
}
