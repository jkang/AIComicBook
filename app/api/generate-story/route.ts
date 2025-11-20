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
        const { storyText, keywords = [], language = 'en', apiKey } = await req.json();

        if (!storyText) {
            return NextResponse.json({ error: 'Story text is required' }, { status: 400 });
        }

        // 优先使用用户提供的 API key，否则使用环境变量
        const finalApiKey = apiKey || process.env.GEMINI_API_KEY;

        if (!finalApiKey) {
            return NextResponse.json({
                error: 'API key is required. Please set GEMINI_API_KEY environment variable or provide your own key.'
            }, { status: 401 });
        }

        // Use the new SDK
        const ai = new GoogleGenAI({ apiKey: finalApiKey });

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
            console.error('❌ [generate-story] No text generated in response');
            return NextResponse.json({ error: 'No text generated' }, { status: 500 });
        }

        // Clean up text if it contains markdown code blocks
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Parse JSON response
        let storyResult: StoryResult;
        try {
            storyResult = JSON.parse(cleanText);
        } catch (parseError) {
            console.error('❌ [generate-story] JSON Parse Error:', parseError);
            return NextResponse.json({ error: 'Failed to parse AI response as JSON' }, { status: 500 });
        }

        // Validate and limit panel count
        if (storyResult.panels.length > maxPanels) {
            storyResult.panels = storyResult.panels.slice(0, maxPanels);
        }

        return NextResponse.json(storyResult);
    } catch (error: any) {
        console.error('❌ [generate-story] Error:', error.message);

        // 识别不同类型的错误
        let errorType = 'general';
        let errorMessage = 'Failed to generate story';
        let statusCode = 500;

        const errorMsg = error.message?.toLowerCase() || '';

        // 配额错误
        if (errorMsg.includes('quota') || errorMsg.includes('rate limit') || errorMsg.includes('429')) {
            errorType = 'quota';
            errorMessage = 'API quota exceeded. Please check your Gemini API quota.';
            statusCode = 429;
        }
        // 认证错误
        else if (errorMsg.includes('api key') || errorMsg.includes('unauthorized') || errorMsg.includes('401') || errorMsg.includes('403')) {
            errorType = 'auth';
            errorMessage = 'Invalid API key. Please check your Gemini API key.';
            statusCode = 401;
        }
        // 网络错误
        else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('timeout')) {
            errorType = 'network';
            errorMessage = 'Network error. Please check your connection and try again.';
            statusCode = 503;
        }

        return NextResponse.json({
            error: errorMessage,
            errorType: errorType,
            details: error.message
        }, { status: statusCode });
    }
}
