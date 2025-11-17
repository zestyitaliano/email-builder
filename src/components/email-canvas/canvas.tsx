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
  latestWidth: number;
  latestHeight: number;
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

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!dragState.current && !resizeState.current) return;
      event.preventDefault();

      if (dragState.current) {
        const deltaX = event.clientX - dragState.current.startX;
        const deltaY = event.clientY - dragState.current.startY;
        const nextTop = dragState.current.originTop + deltaY;
        const nextLeft = dragState.current.originLeft + deltaX;
        dragState.current = { ...dragState.current, latestTop: nextTop, latestLeft: nextLeft };
        onStyleChange(dragState.current.id, { top: nextTop, left: nextLeft }, { commit: false });
      }

      if (resizeState.current) {
        const deltaX = event.clientX - resizeState.current.startX;
        const deltaY = event.clientY - resizeState.current.startY;
        const nextWidth = Math.max(32, resizeState.current.startWidth + deltaX);
        const nextHeight = Math.max(32, resizeState.current.startHeight + deltaY);
        resizeState.current = { ...resizeState.current, latestWidth: nextWidth, latestHeight: nextHeight };
        onStyleChange(resizeState.current.id, { width: nextWidth, height: nextHeight }, { commit: false });
      }
    },
    [onStyleChange]
  );

  const handleMouseUp = useCallback(() => {
    if (dragState.current) {
      const { id, latestTop, latestLeft } = dragState.current;
      onStyleChange(id, { top: latestTop, left: latestLeft }, { commit: true });
      dragState.current = null;
    }

    if (resizeState.current) {
      const { id, latestWidth, latestHeight } = resizeState.current;
      onStyleChange(id, { width: latestWidth, height: latestHeight }, { commit: true });
      resizeState.current = null;
    }

    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove, onStyleChange]);

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>, element: CanvasElement) => {
    if (event.button !== 0) return;
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
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleResizeMouseDown = (event: React.MouseEvent<HTMLDivElement>, element: CanvasElement) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();
    onSelectElement(element.id);
    const width = Number(element.styles.width ?? 200) || 200;
    const height = Number(element.styles.height ?? 100) || 100;

    resizeState.current = {
      id: element.id,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: width,
      startHeight: height,
      latestWidth: width,
      latestHeight: height
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
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
            onMouseDown={(event) => handleResizeMouseDown(event, element)}
            className="absolute -right-1.5 -bottom-1.5 h-3 w-3 rounded-[4px] bg-[#7953D2] shadow ring-4 ring-white ring-offset-0"
            style={{ cursor: "nwse-resize" }}
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
