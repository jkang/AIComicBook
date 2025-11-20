import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";
// @ts-ignore - shared helper is JS
import { generateStoryPrompt } from '../shared/gemini-helper.js';

interface ComicPanelData {
    id: number;
    text: string;
    imagePrompt: string;
}

interface StoryResult {
    characters: string[];
    panels: ComicPanelData[];
    optimizedStory: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { storyText, keywords = [], language = 'en' } = req.body;

        if (!storyText) {
            return res.status(400).json({ error: 'Story text is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        // Use the new SDK
        const ai = new GoogleGenAI({ apiKey: apiKey });

        // Generate prompt using shared helper
        const { prompt, maxPanels } = generateStoryPrompt(storyText, keywords, language);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.8,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192,
                responseMimeType: 'application/json',
            }
        });

        // In the new SDK, response.text() is available directly on the response object or via candidates
        // Let's check the structure. Usually response.text() helper exists if using the high-level client
        // But for safety, let's extract from candidates
        let text = "";
        if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.text) {
                    text += part.text;
                }
            }
        }

        if (!text) {
            throw new Error("No text generated");
        }

        // Parse JSON response
        const storyResult: StoryResult = JSON.parse(text);

        // Validate and limit panel count
        if (storyResult.panels.length > maxPanels) {
            storyResult.panels = storyResult.panels.slice(0, maxPanels);
        }

        return res.status(200).json(storyResult);
    } catch (error: any) {
        console.error('Error generating story:', error);
        return res.status(500).json({
            error: 'Failed to generate story',
            details: error.message
        });
    }
}
