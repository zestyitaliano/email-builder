"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Canvas } from "@/components/email-canvas/canvas";
import { EmailPreviewDialog } from "@/components/email-canvas/email-preview-dialog";
import { SettingsPanel } from "@/components/email-canvas/settings-panel";
import { Button } from "@/components/ui/button";
import { saveCanvasTemplate } from "@/lib/actions";
import { createBaseCanvasElements } from "@/lib/canvasPresets";
import { cloneCanvasElements, createCanvasElement } from "@/lib/types";
import type { CanvasElement, CanvasElementType, Style } from "@/lib/types";

interface EmailCanvasWorkspaceProps {
  initialElements?: CanvasElement[];
  initialTemplateId?: string | null;
}

const palettePresets: Record<string, { primary: string; accent: string; text: string }> = {
  "Blue & Silver": { primary: "#3F51B5", accent: "#E0E7FF", text: "#1F2937" },
  "Warm Coral": { primary: "#F97316", accent: "#FED7AA", text: "#7C2D12" },
  "Emerald Focus": { primary: "#059669", accent: "#A7F3D0", text: "#064E3B" },
  "Violet & Charcoal": { primary: "#7C3AED", accent: "#EDE9FE", text: "#312E81" },
  "Soft Lilac": { primary: "#C084FC", accent: "#F5F3FF", text: "#4C1D95" },
  "Deep Purple": { primary: "#6D28D9", accent: "#DDD6FE", text: "#2E1065" }
};

const DEFAULT_PALETTE = palettePresets["Blue & Silver"];

export function EmailCanvasWorkspace({ initialElements, initialTemplateId = null }: EmailCanvasWorkspaceProps) {
  const startingElements = useMemo(
    () => cloneCanvasElements(initialElements ?? createBaseCanvasElements()),
    [initialElements]
  );

  const [elements, setElements] = useState<CanvasElement[]>(startingElements);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(startingElements[0]?.id ?? null);
  const [history, setHistory] = useState<CanvasElement[][]>([cloneCanvasElements(startingElements)]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const historyIndexRef = useRef(0);
  const preferencesAppliedRef = useRef(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [templateId, setTemplateId] = useState<string | null>(initialTemplateId ?? null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isSaving, startSaveTransition] = useTransition();

  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  useEffect(() => {
    setSaveStatus((current) => (current === "saving" ? current : "idle"));
  }, [elements]);

  const pushHistory = useCallback((snapshot: CanvasElement[]) => {
    setHistory((prev) => {
      const truncated = prev.slice(0, historyIndexRef.current + 1);
      const cloned = cloneCanvasElements(snapshot);
      const updated = [...truncated, cloned];
      historyIndexRef.current = updated.length - 1;
      setHistoryIndex(historyIndexRef.current);
      return updated;
    });
  }, []);

  const applyElementUpdate = useCallback(
    (updater: (current: CanvasElement[]) => CanvasElement[], options?: { commit?: boolean }) => {
      setElements((prev) => {
        const next = updater(prev);
        if (options?.commit) {
          pushHistory(next);
        }
        return next;
      });
    },
    [pushHistory]
  );

  const handleAddElement = useCallback(
    (type: CanvasElementType) => {
      const newElement = createCanvasElement(type);
      newElement.styles.top = 160 + Math.random() * 120;
      newElement.styles.left = 140 + Math.random() * 120;
      applyElementUpdate((prev) => [...prev, newElement], { commit: true });
      setSelectedElementId(newElement.id);
    },
    [applyElementUpdate]
  );

  const updateElementStyle = useCallback(
    (id: string, style: Partial<Style>, options?: { commit?: boolean }) => {
      applyElementUpdate(
        (prev) =>
          prev.map((element) =>
            element.id === id ? { ...element, styles: { ...element.styles, ...style } } : element
          ),
        options
      );
    },
    [applyElementUpdate]
  );

  const handleContentChange = useCallback(
    (id: string, content: string) => {
      applyElementUpdate((prev) => prev.map((element) => (element.id === id ? { ...element, content } : element)), {
        commit: true
      });
    },
    [applyElementUpdate]
  );

  const handleDeleteElement = useCallback(
    (id: string) => {
      applyElementUpdate(
        (prev) => {
          const nextElements = prev.filter((element) => element.id !== id);
          if (prev.length !== nextElements.length) {
            setSelectedElementId((current) => (current === id ? nextElements[0]?.id ?? null : current));
          }
          return nextElements;
        },
        { commit: true }
      );
    },
    [applyElementUpdate]
  );

  const undo = useCallback(() => {
    setHistoryIndex((index) => {
      if (index <= 0) return index;
      const nextIndex = index - 1;
      historyIndexRef.current = nextIndex;
      const snapshot = cloneCanvasElements(history[nextIndex] ?? []);
      setElements(snapshot);
      return nextIndex;
    });
  }, [history]);

  const redo = useCallback(() => {
    setHistoryIndex((index) => {
      if (index >= history.length - 1) return index;
      const nextIndex = index + 1;
      historyIndexRef.current = nextIndex;
      const snapshot = cloneCanvasElements(history[nextIndex] ?? []);
      setElements(snapshot);
      return nextIndex;
    });
  }, [history]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName ?? "";
      if (["INPUT", "TEXTAREA"].includes(tag)) return;
      if ((event.metaKey || event.ctrlKey) && !event.shiftKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undo();
      }
      if ((event.metaKey || event.ctrlKey) && ((event.shiftKey && event.key.toLowerCase() === "z") || event.key.toLowerCase() === "y")) {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [undo, redo]);

  const selectedElement = useMemo(
    () => elements.find((element) => element.id === selectedElementId) ?? null,
    [elements, selectedElementId]
  );

  const handlePanelStyleChange = useCallback(
    (style: Partial<Style>, options?: { commit?: boolean }) => {
      if (!selectedElementId) return;
      updateElementStyle(selectedElementId, style, options);
    },
    [selectedElementId, updateElementStyle]
  );

  const handlePanelContentChange = useCallback(
    (content: string) => {
      if (!selectedElementId) return;
      handleContentChange(selectedElementId, content);
    },
    [selectedElementId, handleContentChange]
  );

  const handleApplyFonts = useCallback(
    (fonts: string[]) => {
      if (!fonts.length) return;
      const fontFamily = fonts[0];
      applyElementUpdate(
        (prev) =>
          prev.map((element) =>
            element.type === "text" ? { ...element, styles: { ...element.styles, fontFamily } } : element
          ),
        { commit: true }
      );
      if (typeof window !== "undefined") {
        window.localStorage.setItem("email_canvas_last_font_family", fontFamily);
      }
    },
    [applyElementUpdate]
  );

  const handleApplyPalette = useCallback(
    (palettes: string[]) => {
      if (!palettes.length) return;
      const paletteName = palettes[0];
      const palette = palettePresets[paletteName] ?? DEFAULT_PALETTE;
      applyElementUpdate(
        (prev) =>
          prev.map((element) => {
            if (element.type === "button") {
              return {
                ...element,
                styles: {
                  ...element.styles,
                  backgroundColor: palette.primary,
                  color: "#ffffff",
                  boxShadow: `0 10px 25px ${palette.primary}33`
                }
              };
            }
            if (element.type === "text") {
              const fontSize = typeof element.styles.fontSize === "number" ? element.styles.fontSize : Number(element.styles.fontSize) || 18;
              const color = fontSize >= 28 ? palette.primary : palette.text;
              return { ...element, styles: { ...element.styles, color } };
            }
            return element;
        }),
        { commit: true }
      );
      if (typeof window !== "undefined") {
        window.localStorage.setItem("email_canvas_last_palette_name", paletteName);
      }
    },
    [applyElementUpdate]
  );

  const handleSave = useCallback(() => {
    setSaveError(null);
    setSaveStatus("saving");
    startSaveTransition(async () => {
      try {
        const id = await saveCanvasTemplate(templateId, elements);
        setTemplateId(id);
        setSaveStatus("saved");
        setLastSavedAt(new Date());
      } catch (error) {
        console.error("Failed to save canvas template", error);
        setSaveStatus("error");
        if (error instanceof Error && error.message === "Not authenticated") {
          setSaveError("Please log in or sign up to save your canvas.");
        } else {
          setSaveError("Failed to save template");
        }
      }
    });
  }, [elements, templateId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (preferencesAppliedRef.current) return;
    if (initialTemplateId !== null) return;

    const storedFont = window.localStorage.getItem("email_canvas_last_font_family");
    const storedPaletteName = window.localStorage.getItem("email_canvas_last_palette_name");

    if (!storedFont && !storedPaletteName) {
      preferencesAppliedRef.current = true;
      return;
    }

    let updated = cloneCanvasElements(elements);
    let changed = false;

    if (storedFont) {
      updated = updated.map((element) =>
        element.type === "text" ? { ...element, styles: { ...element.styles, fontFamily: storedFont } } : element
      );
      changed = true;
    }

    if (storedPaletteName && palettePresets[storedPaletteName]) {
      const storedPalette = palettePresets[storedPaletteName];
      updated = updated.map((element) => {
        if (element.type === "button") {
          return {
            ...element,
            styles: {
              ...element.styles,
              backgroundColor: storedPalette.primary,
              color: "#ffffff",
              boxShadow: `0 10px 25px ${storedPalette.primary}33`
            }
          };
        }
        if (element.type === "text") {
          const fontSize = typeof element.styles.fontSize === "number" ? element.styles.fontSize : Number(element.styles.fontSize) || 18;
          const color = fontSize >= 28 ? storedPalette.primary : storedPalette.text;
          return { ...element, styles: { ...element.styles, color } };
        }
        return element;
      });
      changed = true;
    }

    preferencesAppliedRef.current = true;
    if (changed) {
      setElements(updated);
      setHistory([cloneCanvasElements(updated)]);
      setHistoryIndex(0);
    }
  }, [elements, initialTemplateId]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const statusLabel = useMemo(() => {
    if (saveStatus === "saving" || isSaving) return "Saving...";
    if (saveStatus === "saved" && lastSavedAt) {
      return `Saved ${lastSavedAt.toLocaleTimeString()}`;
    }
    if (saveStatus === "error") return "Save failed";
    return templateId ? "Unsaved changes" : "Draft not saved";
  }, [saveStatus, isSaving, lastSavedAt, templateId]);

  return (
    <div className="min-h-screen bg-[#E8EAF6] px-4 py-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 lg:flex-row">
        <SettingsPanel
          elements={elements}
          selectedElement={selectedElement}
          onAddElement={handleAddElement}
          onStyleChange={handlePanelStyleChange}
          onContentChange={handlePanelContentChange}
          onDeleteElement={handleDeleteElement}
          onApplyFonts={handleApplyFonts}
          onApplyPalette={handleApplyPalette}
        />
        <div className="flex flex-1 flex-col gap-4">
          <header className="rounded-3xl bg-white/90 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Canvas Editor</p>
                <p className="text-2xl font-semibold text-slate-900">Freeform email canvas – design like Figma, export clean HTML.</p>
                <p className="text-sm text-slate-500">History depth: {history.length}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="ghost" onClick={undo} disabled={!canUndo}>
                    Undo
                  </Button>
                  <Button variant="ghost" onClick={redo} disabled={!canRedo}>
                    Redo
                  </Button>
                  <Button onClick={() => setIsPreviewOpen(true)}>Preview</Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving" : "Save"}
                  </Button>
                </div>
                {saveError === "Please log in or sign up to save your canvas." ? (
                  <div className="flex items-center gap-3 text-sm text-rose-600">
                    <span>{saveError}</span>
                    <Link
                      href="/login"
                      className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                    >
                      Log in
                    </Link>
                  </div>
                ) : (
                  <p className={`text-xs ${saveStatus === "error" ? "text-rose-600" : "text-slate-500"}`}>{saveError ?? statusLabel}</p>
                )}
              </div>
            </div>
          </header>
          <Canvas
            elements={elements}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
            onStyleChange={updateElementStyle}
          />
        </div>
      </div>
      <EmailPreviewDialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen} elements={elements} />
    </div>
  );
}
