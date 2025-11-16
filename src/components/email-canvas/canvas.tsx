"use client";

import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import type { CanvasElement, Style } from "@/lib/types";

interface CanvasProps {
  elements: CanvasElement[];
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

export function Canvas({ elements, selectedElementId, onSelectElement, onStyleChange }: CanvasProps) {
  const dragState = useRef<DragState | null>(null);

  const stopDragging = useCallback(() => {
    if (!dragState.current) return;
    const { id, latestTop, latestLeft } = dragState.current;
    onStyleChange(id, { top: latestTop, left: latestLeft }, { commit: true });
    dragState.current = null;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", stopDragging);
  }, [onStyleChange]);

  const handleMouseMove = useCallback(
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

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
    };
  }, [handleMouseMove, stopDragging]);

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
    window.addEventListener("mouseup", stopDragging);
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
        className={`group rounded-3xl border ${isSelected ? "border-[#7953D2] shadow-xl" : "border-transparent"}`}
        onMouseDown={(event) => handleMouseDown(event, element)}
        onClick={(event) => {
          event.stopPropagation();
          onSelectElement(element.id);
        }}
      >
        {renderInnerElement(element, style)}
      </div>
    );
  };

  return (
    <section
      className="relative flex flex-1 items-center justify-center bg-gradient-to-br from-[#E8EAF6] to-[#dfe3ff]"
      onClick={() => onSelectElement(null)}
    >
      <div className="relative mx-auto flex h-[760px] w-[640px] items-center justify-center rounded-[40px] bg-gradient-to-b from-white to-[#f7f8ff] p-10 shadow-2xl">
        <div className="relative h-full w-full rounded-[32px] bg-white shadow-lg">
          {elements.map((element) => renderElement(element))}
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
    const src = typeof style.src === "string" && style.src.length > 0 ? style.src : "https://placehold.co/600x400";
    return (
      <img
        src={src}
        alt={element.content || "Image"}
        className="h-full w-full rounded-3xl object-cover"
        style={{ borderRadius: style.borderRadius }}
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
