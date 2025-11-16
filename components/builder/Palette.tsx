"use client";

import { useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { createNode, type BuilderNodeType } from "@/types/nodes";
import { useBuilderStore } from "@/lib/stores/useBuilderStore";

const blocks: { type: BuilderNodeType; label: string; helper: string }[] = [
  { type: "text", label: "Text", helper: "Paragraph copy" },
  { type: "image", label: "Image", helper: "Remote image" },
  { type: "button", label: "Button", helper: "Clickable CTA" }
];

export function Palette() {
  return (
    <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Blocks</p>
        <p className="text-sm text-slate-500">Drag onto the canvas or click to append.</p>
      </div>
      <div className="space-y-3">
        {blocks.map((block) => (
          <PaletteItem key={block.type} {...block} />
        ))}
      </div>
    </aside>
  );
}

function PaletteItem({ type, label, helper }: { type: BuilderNodeType; label: string; helper: string }) {
  const addNode = useBuilderStore((state) => state.addNode);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: { type }
  });

  const preview = useMemo(() => {
    switch (type) {
      case "image":
        return <div className="h-16 rounded-2xl bg-slate-100" />;
      case "button":
        return (
          <div className="rounded-full bg-slate-900 px-3 py-1 text-center text-xs font-medium text-white">
            Button
          </div>
        );
      case "text":
      default:
        return <div className="space-y-1 text-left text-xs text-slate-500"><p>Heading</p><p>Supporting copy</p></div>;
    }
  }, [type]);

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`flex w-full flex-col gap-2 rounded-2xl border border-slate-200 p-3 text-left transition hover:border-slate-400 ${
        isDragging ? "opacity-50" : ""
      }`}
      onClick={() => addNode(createNode(type))}
      {...attributes}
      {...listeners}
    >
      <div>
        <p className="font-medium text-slate-900">{label}</p>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{helper}</p>
      </div>
      {preview}
    </button>
  );
}
