import type { BuilderNode, ButtonNode, ImageNode, TextNode } from "@/types/nodes";

const fontFamily = "font-family:'Inter','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const createCell = (content: string, styles: string) => `<td style="${styles}">${content}</td>`;

const createRow = (content: string) => `<tr>${content}</tr>`;

const renderTextRow = (node: TextNode) => {
  const lineHeight = Math.round(node.props.fontSize * 1.5);
  const cellStyles = [
    "padding:24px 0",
    `text-align:${node.props.align}`,
    `color:${node.props.color}`,
    `font-size:${node.props.fontSize}px`,
    `line-height:${lineHeight}px`,
    fontFamily
  ].join(";");
  const content = `<div style="${fontFamily}">${escapeHtml(node.props.text)}</div>`;
  return createRow(createCell(content, cellStyles));
};

const renderImageRow = (node: ImageNode) => {
  const image = `<img src="${escapeHtml(node.props.url)}" alt="${escapeHtml(node.props.alt)}" width="${node.props.width}" style="display:block;width:100%;height:auto;border-radius:16px" />`;
  const cellStyles = ["padding:16px 0", "text-align:center"].join(";");
  return createRow(createCell(image, cellStyles));
};

const renderButtonRow = (node: ButtonNode) => {
  const isPrimary = node.props.variant === "primary";
  const background = isPrimary ? "#0f172a" : "transparent";
  const color = isPrimary ? "#ffffff" : "#0f172a";
  const border = isPrimary ? "none" : "2px solid #0f172a";
  const button = `<a href="${escapeHtml(node.props.url)}" style="display:inline-block;padding:14px 32px;border-radius:999px;text-decoration:none;font-weight:600;font-size:16px;line-height:24px;${fontFamily};background-color:${background};color:${color};border:${border}">${escapeHtml(node.props.label)}</a>`;
  const cellStyles = ["padding:24px 0", "text-align:center"].join(";");
  return createRow(createCell(button, cellStyles));
};

const rendererMap: Record<BuilderNode["type"], (node: BuilderNode) => string> = {
  text: (node) => renderTextRow(node as TextNode),
  image: (node) => renderImageRow(node as ImageNode),
  button: (node) => renderButtonRow(node as ButtonNode)
};

export const renderTemplate = (nodes: BuilderNode[]): string => {
  const rows = nodes.map((node) => rendererMap[node.type]?.(node) ?? "").join("");

  const innerTable = `<table role="presentation" width="100%" style="width:100%;border-spacing:0;border-collapse:collapse;max-width:640px;margin:0 auto">${rows}</table>`;

  const outerTable = `<table role="presentation" width="100%" style="width:100%;border-spacing:0;border-collapse:collapse;background-color:#f1f5f9;padding:32px">${createRow(
    createCell(innerTable, "padding:0;text-align:center")
  )}</table>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Email preview</title></head><body style="margin:0;padding:0;background-color:#f8fafc">${outerTable}</body></html>`;
};
