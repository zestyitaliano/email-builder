"use server";

import { suggestImprovedEmailDesign } from "@/ai/flows/suggest-improved-email-design";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import type { CanvasDesignTokens, CanvasDocument, CanvasElement, Style, TextStyle } from "@/lib/types";
import { createDefaultCanvasDocument } from "@/lib/types";

const LAYOUT_KEYS = new Set([
  "top",
  "left",
  "width",
  "height",
  "position",
  "src",
  "objectFit",
  "zIndex"
]);

const RESERVED_PREFIXES = ["data-"];

const toKebabCase = (value: string) => value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function buildTokenCss(tokens: CanvasDesignTokens): string {
  const { textStyles } = tokens;
  const makeRule = (selector: string, ts: TextStyle) =>
    `${selector}{font-family:${ts.fontFamily};font-size:${ts.fontSize}px;font-weight:${ts.fontWeight};line-height:${ts.lineHeight};}`;

  return [
    makeRule(".token-h1", textStyles.h1),
    makeRule(".token-h2", textStyles.h2),
    makeRule(".token-body", textStyles.body)
  ].join("");
}

function styleObjectToInline(style: Style): string {
  return Object.entries(style)
    .filter(([key]) => !LAYOUT_KEYS.has(key) && !RESERVED_PREFIXES.some((prefix) => key.startsWith(prefix)))
    .map(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return "";
      }
      const cssKey = toKebabCase(key);
      const cssValue =
        typeof value === "number" && key !== "fontWeight"
          ? `${value}px`
          : typeof value === "string"
            ? value
            : String(value);
      return `${cssKey}:${cssValue}`;
    })
    .filter(Boolean)
    .join(";");
}

const buildWrapperStyle = (styles: Style) => {
  const top = Number(styles.top ?? 0);
  const left = Number(styles.left ?? 0);
  const width = Number(styles.width ?? 240);
  const height = styles.height !== undefined ? Number(styles.height) : undefined;
  const tokens = [
    "position:absolute",
    `top:${Math.round(top)}px`,
    `left:${Math.round(left)}px`,
    `width:${Math.round(width)}px`,
    "display:flex",
    "align-items:center",
    "justify-content:center"
  ];
  if (height !== undefined && !Number.isNaN(height)) {
    tokens.push(`height:${Math.round(height)}px`);
  }
  return tokens.join(";");
};

const renderElementContent = (element: CanvasElement) => {
  const inlineStyles = styleObjectToInline(element.styles);
  if (element.type === "text") {
    const textClass = element.textStyleKey ? ` class="token-${element.textStyleKey}"` : "";
    return `<div${textClass} style="${inlineStyles}">${escapeHtml(element.content)}</div>`;
  }
  if (element.type === "image") {
    const src = element.imageUrl || element.content || "https://placehold.co/600x400";
    const radius = element.styles.borderRadius ?? 0;
    const radiusValue = typeof radius === "number" ? `${radius}px` : String(radius);
    const baseImageStyles = inlineStyles
      ? `${inlineStyles};object-fit:${element.styles.objectFit ?? "cover"}`
      : `object-fit:${element.styles.objectFit ?? "cover"}`;
    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(element.content || "Image")}" style="${baseImageStyles};width:100%;height:100%;border-radius:${radiusValue}" />`;
  }
  const href = element.linkUrl || "#";
  const targetAttrs = element.openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : "";
  return `<a href="${escapeHtml(href)}"${targetAttrs} style="${inlineStyles};display:inline-flex;align-items:center;justify-content:center;text-decoration:none;">${escapeHtml(element.content)}</a>`;
};

const renderAbsoluteLayout = (elements: CanvasElement[]) =>
  elements
    .map((element) => `<div style="${buildWrapperStyle(element.styles)}">${renderElementContent(element)}</div>`)
    .join("");

export async function exportToHtml(doc: CanvasDocument): Promise<string> {
  const { elements, page } = doc;
  const canvasHtml = renderAbsoluteLayout(elements);
  const tokenCss = buildTokenCss(doc.tokens);
  const width = page.width ?? 600;
  const bg = page.backgroundColor ?? "#ffffff";
  const padding = page.padding ?? 24;
  const contentHeight =
    page.height !== "auto" && page.height !== undefined
      ? Number(page.height)
      : Math.max(
          elements.reduce((max, element) => {
            const top = Number(element.styles.top ?? 0);
            const height =
              element.styles.height !== undefined && element.styles.height !== null
                ? Number(element.styles.height)
                : 120;
            return Math.max(max, top + height);
          }, 0) + 160,
          720
        );
  const heightAttr = `${contentHeight}px`;
  const contentWidth = Math.max(0, width - padding * 2);

  const documentHtml = `<!DOCTYPE html><html lang="en"><head><meta charSet="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Email Preview</title><style type="text/css">${tokenCss}</style></head><body style="margin:0;padding:32px;background-color:${bg};font-family:Inter,Arial,sans-serif;"><table role="presentation" width="100%" style="width:100%;border-spacing:0;border-collapse:collapse;"><tr><td align="center" style="padding:0;"><table role="presentation" width="${width}" style="width:${width}px;border-spacing:0;border-collapse:collapse;background-color:${bg};border-radius:32px;box-shadow:0 20px 45px rgba(63,81,181,0.12);"><tr><td style="position:relative;padding:${padding}px;background-color:${bg};"><div style="position:relative;width:${contentWidth}px;height:${heightAttr};margin:0 auto;">${canvasHtml}</div></td></tr></table></td></tr></table></body></html>`;
  return documentHtml;
}

export async function getAiSuggestions(currentHtml: string) {
  try {
    const suggestions = await suggestImprovedEmailDesign({
      existingTemplateHtml: currentHtml,
      userPreferredFonts: ["Inter", "Roboto", "Lato"],
      userPreferredColorPalettes: ["Blue/Gray", "Purple/Orange", "Monochromatic Green"]
    });
    return { suggestions };
  } catch (error) {
    console.error("Error getting AI suggestions:", error);
    return { error: "Failed to get AI suggestions" };
  }
}

function normalizeCanvasState(raw: unknown): CanvasDocument {
  const defaults = createDefaultCanvasDocument();
  if (Array.isArray(raw)) {
    return { ...defaults, elements: raw as CanvasElement[] };
  }
  if (raw && typeof raw === "object") {
    const doc = raw as Partial<CanvasDocument>;
    return {
      elements: Array.isArray(doc.elements) ? (doc.elements as CanvasElement[]) : defaults.elements,
      page: doc.page ?? defaults.page,
      tokens: doc.tokens ?? defaults.tokens
    };
  }
  return defaults;
}

export async function loadCanvasDocument(id: string): Promise<CanvasDocument> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("templates")
    .select("canvas_state")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error("Failed to load canvas template");
  }

  return normalizeCanvasState(data?.canvas_state);
}

export async function saveCanvasTemplate(templateId: string | null, doc: CanvasDocument): Promise<string> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  if (!templateId) {
    const { data, error } = await supabase
      .from("templates")
      .insert({
        user_id: user.id,
        name: "New Canvas Template",
        status: "draft",
        canvas_state: doc
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Failed to insert canvas template", error);
      throw new Error("Unable to save template");
    }

    return data.id;
  }

  const { data, error } = await supabase
    .from("templates")
    .update({
      canvas_state: doc,
      updated_at: new Date().toISOString()
    })
    .eq("id", templateId)
    .select("id")
    .single();

  if (error || !data) {
    console.error("Failed to update canvas template", error);
    throw new Error("Unable to save template");
  }

  return data.id;
}

export async function duplicateTemplate(id: string): Promise<string> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  const { data: original, error: fetchError } = await supabase.from("templates").select("*").eq("id", id).single();

  if (fetchError || !original) {
    throw new Error("Template not found");
  }

  const { data: copy, error: insertError } = await supabase
    .from("templates")
    .insert({
      user_id: user.id,
      name: original.name || "Untitled Template",
      subject: original.subject,
      status: "draft",
      builder_tree: original.builder_tree,
      canvas_state: original.canvas_state
    })
    .select("id")
    .single();

  if (insertError || !copy) {
    throw new Error("Failed to duplicate template");
  }

  return copy.id;
}
