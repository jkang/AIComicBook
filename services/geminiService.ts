
import { GoogleGenAI } from "@google/genai";

// Define consistent character and style prompts to be used across all generations
const STYLE_GUIDE = `
Art Style: High-quality comic book art, retro-futuristic aesthetic (Solarpunk/Cyberpunk blend). 
Time Period: Year 2050, China.
Atmosphere: Slightly gritty, "lived-in" future. Not sleek and perfect, but functional and worn.
Lighting: Dramatic, often referencing the solar flare (harsh light or sudden darkness).

Character Reference:
1. Zhou Xiaodong (周小东): Young Chinese man (late 20s), messy black hair, wearing casual, slightly worn clothes (t-shirt, shorts). Looks lazy but intelligent. Often holds tools or a multimeter.
2. Tiedan (铁蛋): A mechanical robotic rooster. Metallic body, maybe some rust or exposed wires, glowing optical eyes.
3. Xiaozhi (小智): A smart home AI interface. Can be a glowing holographic orb or a retro-styled cute screen interface.
4. Chen Xiao (陈骁): Young Chinese man (late 20s). Very neat, slicked-back hair, rimless glasses, wearing a pristine high-tech suit or lab coat. Looks elite.
5. Wang Teacher (王老师): Middle-aged Chinese man (50s). Disheveled hair, glasses often askew, wearing a rumpled shirt.
`;

export const generateComicPanelImage = async (panelText: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
    ${STYLE_GUIDE}
    
    Current Panel Description:
    ${panelText}
    
    Task: Generate a single comic book panel image depicting this scene. 
    Ensure character consistency with the reference provided.
    `;

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
