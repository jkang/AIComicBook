import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { generateStoryPrompt } from '../../../shared/gemini-helper';
import { ComicPanelData } from '../../../types';

interface StoryResult {
    characters: string[];
    panels: ComicPanelData[];
    optimizedStory: string;
    visualStyle: string;
}

export async function POST(req: Request) {
    try {
        const { storyText, keywords = [], language = 'en' } = await req.json();

        if (!storyText) {
            return NextResponse.json({ error: 'Story text is required' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
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

        let text = "";
        if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.text) {
                    text += part.text;
                }
            }
        }

        if (!text) {
            console.error('❌ No text generated in response:', JSON.stringify(response, null, 2));
            return NextResponse.json({ error: 'No text generated' }, { status: 500 });
        }

        // Clean up text if it contains markdown code blocks
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Parse JSON response
        let storyResult: StoryResult;
        try {
            storyResult = JSON.parse(cleanText);
        } catch (parseError) {
            console.error('❌ JSON Parse Error:', parseError);
            console.error('Raw Text:', text);
            return NextResponse.json({ error: 'Failed to parse AI response as JSON' }, { status: 500 });
        }

        // Validate and limit panel count
        if (storyResult.panels.length > maxPanels) {
            storyResult.panels = storyResult.panels.slice(0, maxPanels);
        }

        return NextResponse.json(storyResult);
    } catch (error: any) {
        console.error('❌ Error generating story:', error);
        return NextResponse.json({
            error: 'Failed to generate story',
            details: error.message
        }, { status: 500 });
    }
}
