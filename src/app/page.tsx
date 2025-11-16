"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@/components/email-canvas/canvas";
import { EmailPreviewDialog } from "@/components/email-canvas/email-preview-dialog";
import { SettingsPanel } from "@/components/email-canvas/settings-panel";
import { Button } from "@/components/ui/button";
import { cloneCanvasElements, createCanvasElement } from "@/lib/types";
import type { CanvasElement, CanvasElementType, Style } from "@/lib/types";
import { PLACEHOLDER_IMAGES } from "@/lib/placeholder-images";

const baseElements = () => {
  const heading = createCanvasElement("text");
  heading.content = "Design with intention";
  heading.styles.top = 40;
  heading.styles.left = 80;
  heading.styles.width = 360;
  heading.styles.fontSize = 36;
  heading.styles.fontWeight = 700;
  heading.styles.lineHeight = 1.25;

  const body = createCanvasElement("text");
  body.content = "Compose modular sections, drag them into place, and export production-ready HTML in seconds.";
  body.styles.top = 120;
  body.styles.left = 80;
  body.styles.width = 360;
  body.styles.fontSize = 18;
  body.styles.fontWeight = 400;
  body.styles.color = "#4c4f65";

  const heroImage = createCanvasElement("image");
  heroImage.styles.top = 60;
  heroImage.styles.left = 360;
  heroImage.styles.width = 220;
  heroImage.styles.height = 320;
  heroImage.styles.borderRadius = 24;
  heroImage.styles.src = PLACEHOLDER_IMAGES[0].url;
  heroImage.content = PLACEHOLDER_IMAGES[0].label;

  const cta = createCanvasElement("button");
  cta.content = "Preview canvas";
  cta.styles.top = 240;
  cta.styles.left = 80;
  cta.styles.width = 220;
  cta.styles.backgroundColor = "#7953D2";
  cta.styles.boxShadow = "0 12px 30px rgba(121,83,210,0.35)";

  return [heading, body, heroImage, cta];
};

const initialElements = baseElements();

export default function EmailCanvasPage() {
  const [elements, setElements] = useState<CanvasElement[]>(initialElements);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(initialElements[0]?.id ?? null);
  const [history, setHistory] = useState<CanvasElement[][]>([cloneCanvasElements(initialElements)]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const historyIndexRef = useRef(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

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

  const addElement = useCallback(
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
          prev.map((element) => (element.id === id ? { ...element, styles: { ...element.styles, ...style } } : element)),
        options
      );
    },
    [applyElementUpdate]
  );

  const updateElementContent = useCallback(
    (id: string, content: string) => {
      applyElementUpdate((prev) => prev.map((element) => (element.id === id ? { ...element, content } : element)), {
        commit: true
      });
    },
    [applyElementUpdate]
  );

  const deleteElement = useCallback(() => {
    if (!selectedElementId) return;
    applyElementUpdate((prev) => prev.filter((element) => element.id !== selectedElementId), { commit: true });
    setSelectedElementId((prevId) => {
      const remaining = elements.filter((element) => element.id !== prevId);
      return remaining[0]?.id ?? null;
    });
  }, [selectedElementId, applyElementUpdate, elements]);

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
      updateElementContent(selectedElementId, content);
    },
    [selectedElementId, updateElementContent]
  );

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="min-h-screen bg-[#E8EAF6] px-4 py-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 lg:flex-row">
        <SettingsPanel
          elements={elements}
          selectedElement={selectedElement}
          onAddElement={addElement}
          onStyleChange={handlePanelStyleChange}
          onContentChange={handlePanelContentChange}
          onDelete={deleteElement}
        />
        <div className="flex flex-1 flex-col gap-4">
          <header className="rounded-3xl bg-white/90 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Email canvas</p>
                <p className="text-2xl font-semibold text-slate-900">Firebase Studio inspired builder</p>
                <p className="text-sm text-slate-500">History depth: {history.length}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="ghost" onClick={undo} disabled={!canUndo}>
                  Undo
                </Button>
                <Button variant="ghost" onClick={redo} disabled={!canRedo}>
                  Redo
                </Button>
                <Button onClick={() => setIsPreviewOpen(true)}>Preview</Button>
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
