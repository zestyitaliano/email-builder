"use client";

import { useMemo } from "react";
import { useBuilderStore, selectSelectedId } from "@/lib/stores/useBuilderStore";
import type { BuilderNode } from "@/types/nodes";

export function Inspector() {
  const selectedId = useBuilderStore(selectSelectedId);
  const node = useBuilderStore((state) => state.nodes.find((entry) => entry.id === selectedId));

  if (!node) {
    return (
      <aside className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
        Select a block to edit its properties.
      </aside>
    );
  }

  return (
    <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Inspector</p>
        <p className="font-medium text-slate-900">{node.type} block</p>
      </header>
      <NodeForm node={node} />
    </aside>
  );
}

function NodeForm({ node }: { node: BuilderNode }) {
  const updateNodeProps = useBuilderStore((state) => state.updateNodeProps);

  const fields = useMemo(() => {
    switch (node.type) {
      case "text":
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Content
              <textarea
                className="mt-1 w-full rounded-2xl border border-slate-200 p-2"
                rows={4}
                value={node.props.text}
                onChange={(event) => updateNodeProps(node.id, { text: event.target.value })}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Alignment
              <select
                className="mt-1 w-full rounded-2xl border border-slate-200 p-2"
                value={node.props.align}
                onChange={(event) => updateNodeProps(node.id, { align: event.target.value })}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Font size
              <input
                type="number"
                min={12}
                max={48}
                className="mt-1 w-full rounded-2xl border border-slate-200 p-2"
                value={node.props.fontSize}
                onChange={(event) => updateNodeProps(node.id, { fontSize: Number(event.target.value) })}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Color
              <input
                type="color"
                className="mt-1 h-10 w-full rounded-2xl border border-slate-200 p-2"
                value={node.props.color}
                onChange={(event) => updateNodeProps(node.id, { color: event.target.value })}
              />
            </label>
          </div>
        );
      case "image":
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Image URL
              <input
                className="mt-1 w-full rounded-2xl border border-slate-200 p-2"
                value={node.props.url}
                onChange={(event) => updateNodeProps(node.id, { url: event.target.value })}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Alt text
              <input
                className="mt-1 w-full rounded-2xl border border-slate-200 p-2"
                value={node.props.alt}
                onChange={(event) => updateNodeProps(node.id, { alt: event.target.value })}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Width (px)
              <input
                type="number"
                min={100}
                max={800}
                className="mt-1 w-full rounded-2xl border border-slate-200 p-2"
                value={node.props.width}
                onChange={(event) => updateNodeProps(node.id, { width: Number(event.target.value) })}
              />
            </label>
          </div>
        );
      case "button":
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Label
              <input
                className="mt-1 w-full rounded-2xl border border-slate-200 p-2"
                value={node.props.label}
                onChange={(event) => updateNodeProps(node.id, { label: event.target.value })}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              URL
              <input
                className="mt-1 w-full rounded-2xl border border-slate-200 p-2"
                value={node.props.url}
                onChange={(event) => updateNodeProps(node.id, { url: event.target.value })}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Variant
              <select
                className="mt-1 w-full rounded-2xl border border-slate-200 p-2"
                value={node.props.variant}
                onChange={(event) => updateNodeProps(node.id, { variant: event.target.value })}
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
              </select>
            </label>
          </div>
        );
      default:
        return null;
    }
  }, [node, updateNodeProps]);

  return fields;
}
