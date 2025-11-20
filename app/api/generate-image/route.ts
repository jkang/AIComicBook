import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { enhanceComicPrompt } from '../../../shared/gemini-helper';

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
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
            return NextResponse.json({ error: 'No image data received from API' }, { status: 500 });
        }

        return NextResponse.json({
            image: `data:image/png;base64,${imageBase64}`
        });
    } catch (error: any) {
        console.error('Error generating image:', error);
        return NextResponse.json({
            error: 'Failed to generate image',
            details: error.message
        }, { status: 500 });
    }
}
