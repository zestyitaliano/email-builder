import { createCanvasElement } from "@/lib/types";
import type { CanvasElement } from "@/lib/types";
import { PLACEHOLDER_IMAGES } from "@/lib/placeholder-images";

export const createBaseCanvasElements = (): CanvasElement[] => {
  const heading = createCanvasElement("text");
  heading.content = "Design with intention";
  heading.styles.top = 40;
  heading.styles.left = 80;
  heading.styles.width = 360;
  heading.styles.fontSize = 36;
  heading.styles.fontWeight = 700;
  heading.styles.lineHeight = 1.25;

  const body = createCanvasElement("text");
  body.content = "Compose modular sections, drag them into place, and export production-ready HTML in seconds.";
  body.styles.top = 120;
  body.styles.left = 80;
  body.styles.width = 360;
  body.styles.fontSize = 18;
  body.styles.fontWeight = 400;
  body.styles.color = "#4c4f65";

  const heroImage = createCanvasElement("image");
  heroImage.styles.top = 60;
  heroImage.styles.left = 360;
  heroImage.styles.width = 220;
  heroImage.styles.height = 320;
  heroImage.styles.borderRadius = 24;
  heroImage.imageUrl = PLACEHOLDER_IMAGES[0].url;
  heroImage.content = PLACEHOLDER_IMAGES[0].label || heroImage.content;

  const cta = createCanvasElement("button");
  cta.content = "Preview canvas";
  cta.styles.top = 240;
  cta.styles.left = 80;
  cta.styles.width = 220;
  cta.styles.backgroundColor = "#7953D2";
  cta.styles.boxShadow = "0 12px 30px rgba(121,83,210,0.35)";

  return [heading, body, heroImage, cta];
};
