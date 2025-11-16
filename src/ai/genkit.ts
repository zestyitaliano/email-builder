interface GenkitConfiguration {
  plugin: string;
  model: string;
}

export const genkit = {
  config: {
    plugin: "googleai",
    model: "googleai/gemini-2.5-flash"
  } as GenkitConfiguration,
  async generateStructuredJson(prompt: string) {
    const lower = prompt.toLowerCase();
    const useSerif = lower.includes("editorial") || lower.includes("story");
    const fonts = useSerif
      ? ["Playfair Display", "Inter", "Source Serif"]
      : ["Inter", "Roboto", "Lato"];

    const palettes = lower.includes("violet")
      ? ["Violet & Charcoal", "Soft Lilac", "Deep Purple"]
      : ["Blue & Silver", "Warm Coral", "Emerald Focus"];

    return { suggestedFonts: fonts, suggestedColorPalettes: palettes };
  }
};
