"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { BuilderNode, BuilderNodeType } from "@/types/nodes";
import { createNode } from "@/types/nodes";
import { Palette } from "@/components/builder/Palette";
import { Canvas } from "@/components/builder/Canvas";
import { Inspector } from "@/components/builder/Inspector";
import {
  useBuilderStore,
  selectNodes,
  selectDirty
} from "@/lib/stores/useBuilderStore";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

interface BuilderClientProps {
  templateId: string;
  initialNodes: BuilderNode[];
  templateName: string;
  templateSubject?: string | null;
}

export function BuilderClient({ templateId, initialNodes, templateName, templateSubject }: BuilderClientProps) {
  const sensors = useSensors(useSensor(PointerSensor));
  const nodes = useBuilderStore(selectNodes);
  const loadNodes = useBuilderStore((state) => state.loadNodes);
  const addNode = useBuilderStore((state) => state.addNode);
  const reorderNodes = useBuilderStore((state) => state.reorderNodes);
  const markSaved = useBuilderStore((state) => state.markSaved);
  const dirty = useBuilderStore(selectDirty);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    loadNodes(initialNodes ?? []);
  }, [initialNodes, loadNodes]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;
      const activeId = String(active.id);
      const overId = String(over.id);

      if (activeId.startsWith("palette:")) {
        const type = active.data.current?.type as BuilderNodeType;
        const newNode = createNode(type);
        const targetIndex = nodes.findIndex((node) => node.id === overId);
        addNode(newNode, overId === "canvas-dropzone" || targetIndex === -1 ? undefined : targetIndex);
      } else if (overId !== "canvas-dropzone") {
        reorderNodes(activeId, overId);
      }
    },
    [addNode, nodes, reorderNodes]
  );

  const handleSave = useCallback(async () => {
    setStatus("saving");
    const { error } = await supabase
      .from("templates")
      .update({ builder_tree: nodes })
      .eq("id", templateId);
    if (error) {
      setStatus("error");
      return;
    }
    markSaved();
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 1500);
  }, [markSaved, nodes, supabase, templateId]);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Template</p>
          <p className="text-lg font-semibold text-slate-900">{templateName}</p>
          {templateSubject && <p className="text-sm text-slate-500">{templateSubject}</p>}
        </div>
        <div className="flex items-center gap-3">
          <StatusPill status={status} dirty={dirty} />
          <button
            type="button"
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
            onClick={handleSave}
            disabled={status === "saving"}
          >
            {status === "saving" ? "Saving..." : "Save"}
          </button>
        </div>
      </header>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 lg:grid-cols-[250px_1fr_250px]">
          <Palette />
          <Canvas />
          <Inspector />
        </div>
      </DndContext>
    </div>
  );
}

function StatusPill({ status, dirty }: { status: "idle" | "saving" | "saved" | "error"; dirty: boolean }) {
  if (status === "saving") {
    return <span className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600">Saving...</span>;
  }
  if (status === "saved") {
    return <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-700">Saved</span>;
  }
  if (status === "error") {
    return <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm text-rose-700">Error</span>;
  }
  return (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-600">
      {dirty ? "Unsaved changes" : "Up to date"}
    </span>
  );
}
