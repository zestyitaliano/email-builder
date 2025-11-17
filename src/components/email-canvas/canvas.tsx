"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { CanvasElement, CanvasPageSettings, Style } from "@/lib/types";

interface CanvasProps {
  elements: CanvasElement[];
  page: CanvasPageSettings;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onStyleChange: (id: string, style: Partial<Style>, options?: { commit?: boolean }) => void;
}

interface DragState {
  id: string;
  startX: number;
  startY: number;
  originTop: number;
  originLeft: number;
  latestTop: number;
  latestLeft: number;
}

interface ResizeState {
  id: string;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
}

export function Canvas({ elements, page, selectedElementId, onSelectElement, onStyleChange }: CanvasProps) {
  const dragState = useRef<DragState | null>(null);
  const resizeState = useRef<ResizeState | null>(null);

  const contentHeight = useMemo(() => {
    if (page.height !== "auto" && page.height !== undefined) {
      return Number(page.height);
    }
    const maxBottom = elements.reduce((max, element) => {
      const top = Number(element.styles.top ?? 0);
      const height =
        element.styles.height !== undefined && element.styles.height !== null
          ? Number(element.styles.height)
          : 120;
      return Math.max(max, top + height);
    }, 0);
    return Math.max(maxBottom + 160, 720);
  }, [elements, page.height]);

  const pageWidth = useMemo(() => Math.max(page.width, 320), [page.width]);

  const handleDragMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!dragState.current) return;
      event.preventDefault();

      const deltaX = event.clientX - dragState.current.startX;
      const deltaY = event.clientY - dragState.current.startY;
      const nextTop = dragState.current.originTop + deltaY;
      const nextLeft = dragState.current.originLeft + deltaX;
      dragState.current = { ...dragState.current, latestTop: nextTop, latestLeft: nextLeft };
      onStyleChange(dragState.current.id, { top: nextTop, left: nextLeft }, { commit: false });
    },
    [onStyleChange]
  );

  const stopDragging = useCallback(() => {
    if (dragState.current) {
      const { id, latestTop, latestLeft } = dragState.current;
      onStyleChange(id, { top: latestTop, left: latestLeft }, { commit: true });
      dragState.current = null;
    }

    window.removeEventListener("mousemove", handleDragMouseMove);
    window.removeEventListener("mouseup", stopDragging);
  }, [handleDragMouseMove, onStyleChange]);

  const handleResizeMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!resizeState.current) return;

      const dx = event.clientX - resizeState.current.startX;
      const dy = event.clientY - resizeState.current.startY;
      const nextWidth = Math.max(32, resizeState.current.startWidth + dx);
      const nextHeight = Math.max(32, resizeState.current.startHeight + dy);

      onStyleChange(resizeState.current.id, { width: nextWidth, height: nextHeight }, { commit: false });
    },
    [onStyleChange]
  );

  const handleResizeMouseUp = useCallback(
    (event: MouseEvent) => {
      if (resizeState.current) {
        const dx = event.clientX - resizeState.current.startX;
        const dy = event.clientY - resizeState.current.startY;
        const nextWidth = Math.max(32, resizeState.current.startWidth + dx);
        const nextHeight = Math.max(32, resizeState.current.startHeight + dy);

        onStyleChange(resizeState.current.id, { width: nextWidth, height: nextHeight }, { commit: true });
        resizeState.current = null;
      }

      window.removeEventListener("mousemove", handleResizeMouseMove);
      window.removeEventListener("mouseup", handleResizeMouseUp);
    },
    [handleResizeMouseMove, onStyleChange]
  );

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleDragMouseMove);
      window.removeEventListener("mouseup", stopDragging);
      window.removeEventListener("mousemove", handleResizeMouseMove);
      window.removeEventListener("mouseup", handleResizeMouseUp);
    };
  }, [handleDragMouseMove, stopDragging, handleResizeMouseMove, handleResizeMouseUp]);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>, element: CanvasElement) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("[data-resize-handle='true']")) return;
    event.stopPropagation();
    onSelectElement(element.id);
    const { top = 0, left = 0 } = element.styles;
    dragState.current = {
      id: element.id,
      startX: event.clientX,
      startY: event.clientY,
      originTop: Number(top),
      originLeft: Number(left),
      latestTop: Number(top),
      latestLeft: Number(left)
    };
    window.addEventListener("mousemove", handleDragMouseMove);
    window.addEventListener("mouseup", stopDragging);
  };

  const handleResizeMouseDown = (event: React.MouseEvent<HTMLDivElement>, element: CanvasElement) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    onSelectElement(element.id);
    const width =
      typeof element.styles.width === "number" ? element.styles.width : Number(element.styles.width) || 200;
    const height =
      typeof element.styles.height === "number" ? element.styles.height : Number(element.styles.height) || 80;

    resizeState.current = {
      id: element.id,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: width,
      startHeight: height
    };

    window.addEventListener("mousemove", handleResizeMouseMove);
    window.addEventListener("mouseup", handleResizeMouseUp);
  };

  const renderElement = (element: CanvasElement) => {
    const { top = 0, left = 0, width = 240, height, ...style } = element.styles;
    const isSelected = element.id === selectedElementId;
    const wrapperStyle: React.CSSProperties = {
      position: "absolute",
      top: Number(top),
      left: Number(left),
      width: Number(width),
      height: height !== undefined ? Number(height) : undefined,
      cursor: "move"
    };

    return (
      <div
        key={element.id}
        style={wrapperStyle}
        className={`group relative rounded-3xl border ${isSelected ? "border-[#7953D2] shadow-xl" : "border-transparent"}`}
        onMouseDown={(event) => handleMouseDown(event, element)}
        onClick={(event) => {
          event.stopPropagation();
          onSelectElement(element.id);
        }}
      >
        {renderInnerElement(element, style)}
        {isSelected ? (
          <div
            className="absolute h-3 w-3 translate-x-1/2 translate-y-1/2 rounded-full border border-slate-500 bg-white"
            style={{ right: 0, bottom: 0, cursor: "nwse-resize" }}
            data-resize-handle="true"
            onMouseDown={(event) => handleResizeMouseDown(event, element)}
          />
        ) : null}
      </div>
    );
  };

  return (
    <section
      className="relative flex flex-1 items-center justify-center bg-gradient-to-br from-[#E8EAF6] to-[#dfe3ff]"
      onClick={() => onSelectElement(null)}
    >
      <div
        className="relative mx-auto flex items-center justify-center rounded-[40px] bg-gradient-to-b from-white to-[#f7f8ff] p-10 shadow-2xl"
        style={{ width: pageWidth + page.padding * 2 + 80, minHeight: contentHeight + page.padding * 2 + 80 }}
      >
        <div
          className="relative w-full rounded-[32px] shadow-lg"
          style={{ maxWidth: pageWidth + page.padding * 2, backgroundColor: page.backgroundColor }}
        >
          <div
            className="relative"
            style={{
              width: pageWidth,
              minHeight: contentHeight,
              height: page.height === "auto" ? undefined : contentHeight,
              padding: page.padding,
              margin: "0 auto"
            }}
          >
            {elements.map((element) => renderElement(element))}
          </div>
        </div>
      </div>
    </section>
  );
}

const renderInnerElement = (element: CanvasElement, style: Style) => {
  if (element.type === "text") {
    return (
      <div className="h-full w-full rounded-2xl bg-transparent p-4" style={style as React.CSSProperties}>
        {element.content}
      </div>
    );
  }

  if (element.type === "image") {
    const { objectFit, borderRadius, src: styleSrc, ...rest } = style;
    const src =
      element.imageUrl ||
      (typeof styleSrc === "string" && styleSrc.length > 0 ? styleSrc : "https://placehold.co/600x400");
    return (
      <img
        src={src}
        alt={element.content || "Image"}
        className="h-full w-full object-cover"
        style={{ ...rest, objectFit: objectFit ?? "cover", borderRadius }}
      />
    );
  }

  return (
    <button
      className="flex h-full w-full items-center justify-center rounded-full text-sm font-semibold"
      style={{ ...style, borderRadius: style.borderRadius ?? 999 }}
    >
      {element.content}
    </button>
  );
};
