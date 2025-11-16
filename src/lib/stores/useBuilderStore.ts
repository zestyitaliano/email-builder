"use client";

import { create } from "zustand";
import { arrayMove } from "@dnd-kit/sortable";
import type { BuilderNode } from "@/types/nodes";

const cloneNodes = (nodes: BuilderNode[]) => nodes.map((node) => ({ ...node, props: { ...node.props } }));

type BuilderState = {
  nodes: BuilderNode[];
  selectedId?: string;
  past: BuilderNode[][];
  future: BuilderNode[][];
  dirty: boolean;
  loadNodes: (nodes: BuilderNode[]) => void;
  selectNode: (id?: string) => void;
  addNode: (node: BuilderNode, index?: number) => void;
  reorderNodes: (activeId: string, overId: string) => void;
  updateNodeProps: (id: string, props: Record<string, unknown>) => void;
  removeNode: (id: string) => void;
  undo: () => void;
  redo: () => void;
  markSaved: () => void;
};

const commit = (state: BuilderState) => ({
  past: [...state.past, cloneNodes(state.nodes)],
  future: [],
  dirty: true
});

export const useBuilderStore = create<BuilderState>((set, get) => ({
  nodes: [],
  selectedId: undefined,
  past: [],
  future: [],
  dirty: false,
  loadNodes: (nodes) =>
    set(() => ({
      nodes: nodes ?? [],
      selectedId: nodes?.[0]?.id,
      past: [],
      future: [],
      dirty: false
    })),
  selectNode: (id) => set({ selectedId: id }),
  addNode: (node, index) =>
    set((state) => {
      const insertAt = typeof index === "number" ? index : state.nodes.length;
      const nextNodes = [...state.nodes];
      nextNodes.splice(insertAt, 0, node);
      return {
        ...commit(state),
        nodes: nextNodes,
        selectedId: node.id
      };
    }),
  reorderNodes: (activeId, overId) =>
    set((state) => {
      if (activeId === overId) return state;
      const oldIndex = state.nodes.findIndex((node) => node.id === activeId);
      const newIndex = state.nodes.findIndex((node) => node.id === overId);
      if (oldIndex === -1 || newIndex === -1) return state;
      return {
        ...commit(state),
        nodes: arrayMove(state.nodes, oldIndex, newIndex)
      };
    }),
  updateNodeProps: (id, props) =>
    set((state) => {
      const index = state.nodes.findIndex((node) => node.id === id);
      if (index === -1) return state;
      const nextNodes = [...state.nodes];
      nextNodes[index] = {
        ...nextNodes[index],
        props: { ...nextNodes[index].props, ...props }
      } as BuilderNode;
      return {
        ...commit(state),
        nodes: nextNodes
      };
    }),
  removeNode: (id) =>
    set((state) => ({
      ...commit(state),
      nodes: state.nodes.filter((node) => node.id !== id),
      selectedId: state.selectedId === id ? undefined : state.selectedId
    })),
  undo: () =>
    set((state) => {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const past = state.past.slice(0, -1);
      return {
        nodes: cloneNodes(previous),
        selectedId: previous[0]?.id,
        past,
        future: [cloneNodes(state.nodes), ...state.future],
        dirty: true
      };
    }),
  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state;
      const [next, ...rest] = state.future;
      return {
        nodes: cloneNodes(next),
        selectedId: next[0]?.id,
        past: [...state.past, cloneNodes(state.nodes)],
        future: rest,
        dirty: true
      };
    }),
  markSaved: () => set({ dirty: false })
}));

export const selectNodes = (state: BuilderState) => state.nodes;
export const selectSelectedId = (state: BuilderState) => state.selectedId;
export const selectDirty = (state: BuilderState) => state.dirty;
