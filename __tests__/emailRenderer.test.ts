// @ts-nocheck
import { renderTemplate } from "@/lib/emailRenderer";
import type { BuilderNode } from "@/types/nodes";

describe("renderTemplate", () => {
  const nodes: BuilderNode[] = [
    {
      id: "text-1",
      type: "text",
      props: {
        text: "Hello world",
        align: "center",
        color: "#111827",
        fontSize: 18
      }
    },
    {
      id: "image-1",
      type: "image",
      props: {
        url: "https://example.com/banner.png",
        alt: "Banner",
        width: 600
      }
    },
    {
      id: "button-1",
      type: "button",
      props: {
        label: "Shop now",
        url: "https://example.com",
        variant: "primary"
      }
    }
  ];

  it("wraps rows in an HTML document", () => {
    const html = renderTemplate(nodes);
    expect(html.startsWith("<!DOCTYPE html><html")).toBe(true);
    expect(html).toContain("Hello world");
    expect(html).toContain("https://example.com/banner.png");
    expect(html).toContain("Shop now");
  });

  it("adds inline styles for each row", () => {
    const html = renderTemplate(nodes);
    expect(html).toContain("style=\"padding:24px 0;text-align:center;color:#111827;font-size:18px;line-height:27px");
    expect(html).toContain("border-radius:999px");
  });
});
