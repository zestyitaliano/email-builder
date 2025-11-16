import { genkit } from "@/ai/genkit";

export interface SuggestImprovedEmailDesignInput {
  existingTemplateHtml: string;
  userPreferredFonts: string[];
  userPreferredColorPalettes: string[];
}

export interface SuggestImprovedEmailDesignOutput {
  suggestedFonts: string[];
  suggestedColorPalettes: string[];
}

export async function suggestImprovedEmailDesign(
  input: SuggestImprovedEmailDesignInput
): Promise<SuggestImprovedEmailDesignOutput> {
  const prompt = [
    "You are Email Canvas, an assistant that returns JSON only.",
    "Analyze the provided HTML snippet and suggest modern fonts and color palettes.",
    `HTML:${input.existingTemplateHtml.slice(0, 2000)}`,
    `Preferred fonts:${input.userPreferredFonts.join(",")}`,
    `Preferred palettes:${input.userPreferredColorPalettes.join(",")}`
  ].join("\n");

  const response = await genkit.generateStructuredJson(prompt);
  return response;
}
