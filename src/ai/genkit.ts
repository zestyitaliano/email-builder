interface GenkitConfiguration {
  plugin: string;
  model: string;
}

interface SuggestionResponse {
  suggestedFonts: string[];
  suggestedColorPalettes: string[];
}

const useRealModel = process.env.USE_REAL_GENKIT === "true";

const buildStubResponse = (prompt: string): SuggestionResponse => {
  const lower = prompt.toLowerCase();
  const useSerif = lower.includes("editorial") || lower.includes("story");
  const fonts = useSerif ? ["Playfair Display", "Inter", "Source Serif"] : ["Inter", "Roboto", "Lato"];

  const palettes = lower.includes("violet")
    ? ["Violet & Charcoal", "Soft Lilac", "Deep Purple"]
    : ["Blue & Silver", "Warm Coral", "Emerald Focus"];

  return { suggestedFonts: fonts, suggestedColorPalettes: palettes };
};

const parseModelResponse = (payload: any): SuggestionResponse | null => {
  if (!payload?.candidates?.[0]?.content?.parts) {
    return null;
  }

  const textOutput = payload.candidates[0].content.parts
    .map((part: { text?: string }) => part.text ?? "")
    .join("\n")
    .trim();

  if (!textOutput) {
    return null;
  }

  try {
    const parsed = JSON.parse(textOutput);
    if (Array.isArray(parsed.suggestedFonts) && Array.isArray(parsed.suggestedColorPalettes)) {
      return parsed;
    }
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
  }

  return null;
};

export const genkit = {
  config: {
    plugin: "googleai",
    model: "googleai/gemini-2.5-flash"
  } as GenkitConfiguration,
  async generateStructuredJson(prompt: string): Promise<SuggestionResponse> {
    if (!useRealModel) {
      return buildStubResponse(prompt);
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      console.warn("USE_REAL_GENKIT is true but GOOGLE_AI_API_KEY is missing. Falling back to stub suggestions.");
      return buildStubResponse(prompt);
    }

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/googleai%2Fgemini-2.5-flash:generateContent" +
          `?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.3
            }
          })
        }
      );

      if (!response.ok) {
        console.error("Gemini API error", await response.text());
        return buildStubResponse(prompt);
      }

      const payload = await response.json();
      const parsed = parseModelResponse(payload);
      if (parsed) {
        return parsed;
      }
    } catch (error) {
      console.error("Failed to call Gemini API", error);
    }

    return buildStubResponse(prompt);
  }
};
