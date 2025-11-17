import type React from "react";
import type { BuilderNode } from "@/types/nodes";

export interface Style extends React.CSSProperties {
  [key: string]: any;
}

export type CanvasElementType = "text" | "image" | "button";

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  content: string;
  styles: Style;
  imageUrl?: string; // used for type === "image"
  linkUrl?: string;
  openInNewTab?: boolean;
  maintainAspectRatio?: boolean;
  intrinsicAspectRatio?: number; // width / height
}

export interface CanvasPageSettings {
  width: number;
  height: number | "auto";
  backgroundColor: string;
  padding: number;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
}

export interface CanvasDesignTokens {
  textStyles: {
    h1: TextStyle;
    h2: TextStyle;
    body: TextStyle;
  };
  colorSwatches: string[];
}

export interface CanvasDocument {
  elements: CanvasElement[];
  page: CanvasPageSettings;
  tokens: CanvasDesignTokens;
}

export function createDefaultCanvasDocument(elements: CanvasElement[] = []): CanvasDocument {
  return {
    elements,
    page: {
      width: 600,
      height: "auto",
      backgroundColor: "#ffffff",
      padding: 24
    },
    tokens: {
      textStyles: {
        h1: {
          fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: 28,
          fontWeight: 700,
          lineHeight: 1.2
        },
        h2: {
          fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: 22,
          fontWeight: 600,
          lineHeight: 1.3
        },
        body: {
          fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: 16,
          fontWeight: 400,
          lineHeight: 1.5
        }
      },
      colorSwatches: ["#111827", "#2563EB", "#F97316", "#10B981"]
    }
  };
}

const randomId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const baseElementStyles: Record<CanvasElementType, Style> = {
  text: {
    top: 120,
    left: 120,
    width: 360,
    minHeight: 48,
    color: "#111827",
    fontSize: 20,
    fontWeight: 600,
    fontFamily: "Inter, 'Helvetica Neue', Arial, sans-serif",
    lineHeight: 1.4,
    textAlign: "left"
  },
  image: {
    top: 220,
    left: 80,
    width: 440,
    height: 240,
    objectFit: "cover",
    borderRadius: 16,
    backgroundColor: "#dfe3f5"
  },
  button: {
    top: 520,
    left: 200,
    width: 200,
    height: 48,
    backgroundColor: "#3F51B5",
    color: "#ffffff",
    borderRadius: 999,
    fontWeight: 600,
    fontFamily: "Inter, 'Helvetica Neue', Arial, sans-serif",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
};

const defaultContent: Record<CanvasElementType, string> = {
  text: "Tell your story with confident typography.",
  image: "https://placehold.co/600x400",
  button: "Explore now"
};

export const createCanvasElement = (type: CanvasElementType): CanvasElement => {
  const base: CanvasElement = {
    id: `${type}-${randomId()}`,
    type,
    content: defaultContent[type],
    styles: { ...baseElementStyles[type] }
  };

  if (type === "image") {
    return { ...base, imageUrl: undefined };
  }

  if (type === "button") {
    return { ...base, linkUrl: undefined, openInNewTab: false };
  }

  return base;
};

export const cloneCanvasElements = (elements: CanvasElement[]): CanvasElement[] =>
  elements.map((element) => ({ ...element, styles: { ...element.styles } }));

export const migrateBuilderNode = (node: BuilderNode, index = 0): CanvasElement => {
  if (node.type === "text") {
    return {
      id: node.id,
      type: "text",
      content: node.props.text,
      styles: {
        ...baseElementStyles.text,
        top: 80 + index * 120,
        left: 80,
        color: node.props.color,
        fontSize: node.props.fontSize,
        textAlign: node.props.align
      }
    };
  }

  if (node.type === "image") {
    return {
      id: node.id,
      type: "image",
      content: node.props.url ?? node.props.alt,
      imageUrl: node.props.url,
      styles: {
        ...baseElementStyles.image,
        width: node.props.width,
        top: 140 + index * 140
      }
    };
  }

  return {
    id: node.id,
    type: "button",
    content: node.props.label,
    linkUrl: node.props.link,
    styles: {
      ...baseElementStyles.button,
      backgroundColor: node.props.variant === "primary" ? "#3F51B5" : "#ffffff",
      color: node.props.variant === "primary" ? "#ffffff" : "#111827",
      borderColor: node.props.variant === "primary" ? "transparent" : "#111827",
      top: 180 + index * 100
    }
  };
};

export const migrateLegacyNodes = (nodes: BuilderNode[]): CanvasElement[] =>
  nodes.map((node, index) => migrateBuilderNode(node, index));
