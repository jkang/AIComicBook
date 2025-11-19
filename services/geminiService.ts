
import { GoogleGenAI } from "@google/genai";

export const generateComicPanelImage = async (prompt: string): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("VITE_GEMINI_API_KEY environment variable is not set");
    }

    const ai = new GoogleGenAI({ apiKey });

    // The prompt is now passed directly from the component, which pulls it from constants.ts
    // The constants.ts file already contains the style guide and character descriptions in the prompt.

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '4:3',
        outputMimeType: 'image/jpeg',
      },
    });

    const base64Image = response.generatedImages?.[0]?.image?.imageBytes;

    if (!base64Image) {
      throw new Error("No image data received from API");
    }

    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};
