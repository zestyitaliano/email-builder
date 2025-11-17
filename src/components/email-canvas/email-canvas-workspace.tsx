"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Canvas } from "@/components/email-canvas/canvas";
import { EmailPreviewDialog } from "@/components/email-canvas/email-preview-dialog";
import { SettingsPanel } from "@/components/email-canvas/settings-panel";
import { Button } from "@/components/ui/button";
import { saveCanvasTemplate } from "@/lib/actions";
import { createBaseCanvasElements } from "@/lib/canvasPresets";
import {
  cloneCanvasElements,
  createCanvasElement,
  createDefaultCanvasDocument
} from "@/lib/types";
import type {
  CanvasDesignTokens,
  CanvasDocument,
  CanvasElement,
  CanvasElementType,
  CanvasPageSettings,
  Style
} from "@/lib/types";

interface EmailCanvasWorkspaceProps {
  initialDocument?: CanvasDocument;
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

export function EmailCanvasWorkspace({ initialDocument, initialTemplateId = null }: EmailCanvasWorkspaceProps) {
  const seedDoc = useMemo(() => {
    const defaults = createDefaultCanvasDocument();
    if (initialDocument) {
      return {
        ...defaults,
        ...initialDocument,
        elements: cloneCanvasElements(initialDocument.elements ?? [])
      };
    }
    return {
      ...defaults,
      elements: cloneCanvasElements(createBaseCanvasElements())
    };
  }, [initialDocument]);

  const [doc, setDoc] = useState<CanvasDocument>(seedDoc);
  const elements = doc.elements;
  const [selectedElementId, setSelectedElementId] = useState<string | null>(elements[0]?.id ?? null);
  const [history, setHistory] = useState<CanvasElement[][]>([cloneCanvasElements(elements)]);
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
  }, [doc]);

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
      setDoc((prev) => {
        const nextElements = updater(prev.elements);
        const nextDoc = { ...prev, elements: nextElements };
        if (options?.commit) {
          pushHistory(nextElements);
        }
        return nextDoc;
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
      setDoc((prev) => ({ ...prev, elements: snapshot }));
      return nextIndex;
    });
  }, [history]);

  const redo = useCallback(() => {
    setHistoryIndex((index) => {
      if (index >= history.length - 1) return index;
      const nextIndex = index + 1;
      historyIndexRef.current = nextIndex;
      const snapshot = cloneCanvasElements(history[nextIndex] ?? []);
      setDoc((prev) => ({ ...prev, elements: snapshot }));
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
      if (
        (event.metaKey || event.ctrlKey) &&
        ((event.shiftKey && event.key.toLowerCase() === "z") || event.key.toLowerCase() === "y")
      ) {
        event.preventDefault();
        redo();
      }

      if (!selectedElementId) return;
      if (event.altKey) return;
      if (!event.key.startsWith("Arrow")) return;

      const selected = elements.find((element) => element.id === selectedElementId);
      if (!selected) return;

      const nudgeAmount = event.shiftKey ? 5 : 1;
      const currentTop =
        typeof selected.styles.top === "number" ? selected.styles.top : Number(selected.styles.top) || 0;
      const currentLeft =
        typeof selected.styles.left === "number" ? selected.styles.left : Number(selected.styles.left) || 0;

      const stylePatch: Partial<Style> = {};

      if (event.key === "ArrowUp") {
        stylePatch.top = currentTop - nudgeAmount;
      }
      if (event.key === "ArrowDown") {
        stylePatch.top = currentTop + nudgeAmount;
      }
      if (event.key === "ArrowLeft") {
        stylePatch.left = currentLeft - nudgeAmount;
      }
      if (event.key === "ArrowRight") {
        stylePatch.left = currentLeft + nudgeAmount;
      }

      if (Object.keys(stylePatch).length) {
        event.preventDefault();
        updateElementStyle(selectedElementId, stylePatch, { commit: true });
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [undo, redo, selectedElementId, elements, updateElementStyle]);

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

  const handleElementMetaChange = useCallback(
    (id: string, patch: Partial<CanvasElement>, options: { commit?: boolean } = { commit: true }) => {
      applyElementUpdate(
        (prev) => prev.map((element) => (element.id === id ? { ...element, ...patch } : element)),
        options
      );
    },
    [applyElementUpdate]
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

  const updatePageSettings = useCallback((patch: Partial<CanvasPageSettings>) => {
    setDoc((prev) => ({
      ...prev,
      page: { ...prev.page, ...patch }
    }));
  }, []);

  const updateTokens = useCallback((patch: Partial<CanvasDesignTokens>) => {
    setDoc((prev) => ({
      ...prev,
      tokens: {
        ...prev.tokens,
        ...patch,
        textStyles: patch.textStyles
          ? { ...prev.tokens.textStyles, ...patch.textStyles }
          : prev.tokens.textStyles
      }
    }));
  }, []);

  const applyTextStyle = useCallback(
    (variant: keyof CanvasDesignTokens["textStyles"]) => {
      if (!selectedElement || selectedElement.type !== "text") return;
      const style = doc.tokens.textStyles[variant];
      if (!style) return;
      updateElementStyle(selectedElement.id, style, { commit: true });
    },
    [doc.tokens.textStyles, selectedElement, updateElementStyle]
  );

  const applyColorSwatch = useCallback(
    (color: string) => {
      if (!selectedElement) return;
      const stylePatch: Partial<Style> =
        selectedElement.type === "text" ? { color } : { backgroundColor: color };
      updateElementStyle(selectedElement.id, stylePatch, { commit: true });
    },
    [selectedElement, updateElementStyle]
  );

  const handleAddSwatch = useCallback(() => {
    let newColor = "";
    if (selectedElement) {
      newColor =
        selectedElement.type === "text"
          ? String(selectedElement.styles.color ?? "")
          : String(selectedElement.styles.backgroundColor ?? "");
    }

    if (!newColor) {
      newColor = typeof window !== "undefined" ? window.prompt("Enter a hex color", "#111827") || "" : "";
    }

    if (!newColor) return;

    setDoc((prev) => {
      const nextSwatches = Array.from(new Set([...prev.tokens.colorSwatches, newColor]));
      return { ...prev, tokens: { ...prev.tokens, colorSwatches: nextSwatches } };
    });
  }, [selectedElement]);

  const handleRemoveSwatch = useCallback((color: string) => {
    setDoc((prev) => ({
      ...prev,
      tokens: { ...prev.tokens, colorSwatches: prev.tokens.colorSwatches.filter((swatch) => swatch !== color) }
    }));
  }, []);

  const handleSave = useCallback(() => {
    setSaveError(null);
    setSaveStatus("saving");
    startSaveTransition(async () => {
      try {
        const id = await saveCanvasTemplate(templateId, doc);
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
  }, [doc, templateId]);

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
      setDoc((prev) => ({ ...prev, elements: updated }));
      setHistory([cloneCanvasElements(updated)]);
      setHistoryIndex(0);
    }
  }, [elements, initialTemplateId, setDoc]);

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
          pageSettings={doc.page}
          tokens={doc.tokens}
          onAddElement={handleAddElement}
          onStyleChange={handlePanelStyleChange}
          onContentChange={handlePanelContentChange}
          onElementMetaChange={handleElementMetaChange}
          onDeleteElement={handleDeleteElement}
          onApplyFonts={handleApplyFonts}
          onApplyPalette={handleApplyPalette}
          onPageSettingsChange={updatePageSettings}
          onTokensChange={updateTokens}
          onApplyTextStyle={applyTextStyle}
          onApplyColorSwatch={applyColorSwatch}
          onAddSwatch={handleAddSwatch}
          onRemoveSwatch={handleRemoveSwatch}
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
            page={doc.page}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
            onStyleChange={updateElementStyle}
          />
        </div>
      </div>
      <EmailPreviewDialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen} doc={doc} />
    </div>
  );
}
