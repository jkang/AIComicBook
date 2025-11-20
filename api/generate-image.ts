import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";
// @ts-ignore - shared helper is JS
import { enhanceComicPrompt } from '../shared/gemini-helper.js';

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

        // Enhance prompt for consistency using shared helper
        const enhancedPrompt = enhanceComicPrompt(prompt);

        // Use the new SDK for Gemini 2.5 Flash Image
        const ai = new GoogleGenAI({ apiKey: apiKey });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: enhancedPrompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        // Handle the response to find image data
        let imageBase64 = null;

        // The response structure in the new SDK might be slightly different
        // We need to check where the inlineData is located
        if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    imageBase64 = part.inlineData.data;
                    break;
                }
            }
        }

        if (!imageBase64) {
            console.error('No image data in response', JSON.stringify(response, null, 2));
            return res.status(500).json({ error: 'No image data received from API' });
        }

        return res.status(200).json({
            image: `data:image/png;base64,${imageBase64}`
        });
    } catch (error: any) {
        console.error('Error generating image:', error);
        return res.status(500).json({
            error: 'Failed to generate image',
            details: error.message
        });
    }
}
