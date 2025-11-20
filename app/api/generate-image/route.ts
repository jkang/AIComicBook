import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { enhanceComicPrompt } from '../../../shared/gemini-helper';

export async function POST(req: Request) {
    console.log('🚀 [generate-image] API called');

    try {
        const { prompt } = await req.json();
        console.log('📝 [generate-image] Prompt length:', prompt?.length);

        if (!prompt) {
            console.error('❌ [generate-image] Prompt is missing');
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // 优先使用用户提供的 API key，否则使用环境变量
        const userApiKey = req.headers.get('x-gemini-api-key');
        const apiKey = userApiKey || process.env.GEMINI_API_KEY;

        console.log('🔑 [generate-image] API key source:', userApiKey ? 'user-provided' : 'environment');

        if (!apiKey) {
            console.error('❌ [generate-image] No API key available');
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        // Enhance prompt for consistency using shared helper
        console.log('📋 [generate-image] Enhancing prompt...');
        const enhancedPrompt = enhanceComicPrompt(prompt);

        // Use the new SDK for Gemini 2.5 Flash Image
        console.log('🤖 [generate-image] Initializing GoogleGenAI...');
        const ai = new GoogleGenAI({ apiKey: apiKey });

        console.log('🌐 [generate-image] Calling Gemini API...');
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: enhancedPrompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        console.log('✅ [generate-image] Gemini API response received');

        // Handle the response to find image data
        let imageBase64 = null;

        if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    imageBase64 = part.inlineData.data;
                    console.log('🖼️ [generate-image] Image data found, size:', imageBase64.length);
                    break;
                }
            }
        }

        if (!imageBase64) {
            console.error('❌ [generate-image] No image data in response:', JSON.stringify(response, null, 2));
            return NextResponse.json({ error: 'No image data received from API' }, { status: 500 });
        }

        console.log('🎉 [generate-image] Image generation successful');
        return NextResponse.json({
            image: `data:image/png;base64,${imageBase64}`
        });
    } catch (error: any) {
        console.error('❌ [generate-image] Error:', error);
        console.error('❌ [generate-image] Error stack:', error.stack);
        console.error('❌ [generate-image] Error details:', {
            name: error.name,
            message: error.message,
            cause: error.cause
        });
        return NextResponse.json({
            error: 'Failed to generate image',
            details: error.message
        }, { status: 500 });
    }
}
