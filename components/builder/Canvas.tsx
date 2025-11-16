"use client";

import Image from "next/image";
import { useCallback } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { BuilderNode } from "@/types/nodes";
import { useBuilderStore, selectNodes, selectSelectedId } from "@/lib/stores/useBuilderStore";

export function Canvas() {
  const nodes = useBuilderStore(selectNodes);
  const selectedId = useBuilderStore(selectSelectedId);
  const selectNode = useBuilderStore((state) => state.selectNode);
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-dropzone" });

  return (
    <section
      ref={setNodeRef}
      className={`min-h-[600px] flex-1 rounded-3xl border border-dashed ${
        isOver ? "border-slate-500 bg-slate-50" : "border-slate-200 bg-white"
      } p-6 shadow-inner`}
      onClick={() => selectNode(undefined)}
    >
      <SortableContext items={nodes.map((node) => node.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-4">
          {nodes.length === 0 && (
            <p className="text-center text-slate-400">Drag blocks here to start building.</p>
          )}
          {nodes.map((node) => (
            <CanvasBlock
              key={node.id}
              node={node}
              selected={selectedId === node.id}
              onSelect={() => selectNode(node.id)}
            />
          ))}
        </div>
      </SortableContext>
    </section>
  );
}

function CanvasBlock({ node, selected, onSelect }: { node: BuilderNode; selected: boolean; onSelect: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: node.id });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition
  };

  const renderNode = useCallback(() => {
    switch (node.type) {
      case "image":
        return (
          <div className="overflow-hidden rounded-2xl border border-slate-200" style={{ maxWidth: 640 }}>
            <Image
              src={node.props.url}
              alt={node.props.alt}
              width={node.props.width}
              height={Math.max(200, Math.round(node.props.width * 0.5))}
              className="h-auto w-full"
              unoptimized
            />
          </div>
        );
      case "button":
        return (
          <a
            className={`inline-block rounded-full px-6 py-3 text-center text-sm font-semibold ${
              node.props.variant === "primary" ? "bg-slate-900 text-white" : "border border-slate-400 text-slate-700"
            }`}
            href={node.props.url}
            onClick={(event) => event.preventDefault()}
          >
            {node.props.label}
          </a>
        );
      case "text":
      default:
        return (
          <div style={{ color: node.props.color, textAlign: node.props.align, fontSize: node.props.fontSize }}>
            {node.props.text}
          </div>
        );
    }
  }, [node]);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={`rounded-3xl border p-4 ${
        selected ? "border-slate-900 bg-white" : "border-transparent bg-slate-50 hover:border-slate-200"
      } cursor-grab`}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      {renderNode()}
    </div>
  );
}
