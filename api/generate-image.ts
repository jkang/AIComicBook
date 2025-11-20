import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        // Enhance prompt for consistency
        const enhancedPrompt = enhanceComicPrompt(prompt);

        // Use Google AI Studio API (not Vertex AI)
        const genAI = new GoogleGenerativeAI(apiKey);

        // Use Gemini 1.5 Flash - supports image generation via text prompts
        // Note: Imagen models are not available in AI Studio API
        // gemini-2.5-flash-image has quota limits on free tier
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-image'
        });

        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{
                    text: enhancedPrompt
                }]
            }],
            generationConfig: {
                temperature: 0.4,
                candidateCount: 1,
            }
        });

        // Extract image from response
        const response = result.response;
        const imageData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;

        if (!imageData || !imageData.data) {
            return res.status(500).json({ error: 'No image data received from API' });
        }

        return res.status(200).json({
            image: `data:${imageData.mimeType};base64,${imageData.data}`
        });
    } catch (error: any) {
        console.error('Error generating image:', error);
        return res.status(500).json({
            error: 'Failed to generate image',
            details: error.message
        });
    }
}

/**
 * Enhance comic prompt for consistency
 */
function enhanceComicPrompt(originalPrompt: string): string {
    const STYLE_BASE = "comic book art style, retro-futuristic 2050 China aesthetics, cel-shaded, intricate details, atmospheric lighting, 4k resolution.";

    if (originalPrompt.includes('comic book art style') ||
        originalPrompt.includes(STYLE_BASE)) {
        return originalPrompt;
    }

    const guidelines = [
        "Use English for any text or UI elements in the image to avoid garbled characters.",
        "Maintain consistent character appearances if characters are mentioned.",
        "Apply cinematic composition with clear focal points.",
        "Ensure proper depth and atmospheric perspective."
    ].join(' ');

    return `${STYLE_BASE} ${originalPrompt} ${guidelines}`;
}
