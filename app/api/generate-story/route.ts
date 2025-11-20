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
    console.log('🚀 [generate-story] API called');

    try {
        const { storyText, keywords = [], language = 'en', apiKey } = await req.json();
        console.log('📝 [generate-story] Request data:', {
            storyTextLength: storyText?.length,
            keywords,
            language
        });
        console.log('🔑 [generate-story] API key provided:', !!apiKey);

        if (!storyText) {
            console.error('❌ [generate-story] Story text is missing');
            return NextResponse.json({ error: 'Story text is required' }, { status: 400 });
        }

        // 要求用户必须提供 API key
        if (!apiKey) {
            console.error('❌ [generate-story] No API key provided');
            return NextResponse.json({
                error: 'API key is required. Please set your Gemini API key in settings.'
            }, { status: 401 });
        }

        console.log('🤖 [generate-story] Initializing GoogleGenAI...');
        // Use the new SDK
        const ai = new GoogleGenAI({ apiKey: apiKey });

        // Generate prompt using shared helper
        console.log('📋 [generate-story] Generating prompt...');
        const { prompt, maxPanels } = generateStoryPrompt(storyText, keywords, language);
        console.log('📋 [generate-story] Max panels:', maxPanels);

        console.log('🌐 [generate-story] Calling Gemini API...');
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

        console.log('✅ [generate-story] Gemini API response received');

        let text = "";
        if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.text) {
                    text += part.text;
                }
            }
        }

        console.log('📄 [generate-story] Extracted text length:', text.length);

        if (!text) {
            console.error('❌ [generate-story] No text generated in response:', JSON.stringify(response, null, 2));
            return NextResponse.json({ error: 'No text generated' }, { status: 500 });
        }

        // Clean up text if it contains markdown code blocks
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        console.log('🧹 [generate-story] Cleaned text length:', cleanText.length);

        // Parse JSON response
        let storyResult: StoryResult;
        try {
            storyResult = JSON.parse(cleanText);
            console.log('✅ [generate-story] JSON parsed successfully, panels:', storyResult.panels?.length);
        } catch (parseError) {
            console.error('❌ [generate-story] JSON Parse Error:', parseError);
            console.error('❌ [generate-story] Raw Text:', text);
            return NextResponse.json({ error: 'Failed to parse AI response as JSON' }, { status: 500 });
        }

        // Validate and limit panel count
        if (storyResult.panels.length > maxPanels) {
            console.log(`⚠️ [generate-story] Limiting panels from ${storyResult.panels.length} to ${maxPanels}`);
            storyResult.panels = storyResult.panels.slice(0, maxPanels);
        }

        console.log('🎉 [generate-story] Story generation successful');
        return NextResponse.json(storyResult);
    } catch (error: any) {
        console.error('❌ [generate-story] Error:', error);
        console.error('❌ [generate-story] Error stack:', error.stack);
        console.error('❌ [generate-story] Error details:', {
            name: error.name,
            message: error.message,
            cause: error.cause
        });

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
