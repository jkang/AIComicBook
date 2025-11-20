import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { enhanceComicPrompt } from '../../../shared/gemini-helper';

export async function POST(req: Request) {
    console.log('🚀 [generate-image] API called');

    try {
        const { prompt, apiKey } = await req.json();
        console.log('📝 [generate-image] Prompt length:', prompt?.length);
        console.log('🔑 [generate-image] API key provided:', !!apiKey);

        if (!prompt) {
            console.error('❌ [generate-image] Prompt is missing');
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // 要求用户必须提供 API key
        if (!apiKey) {
            console.error('❌ [generate-image] No API key provided');
            return NextResponse.json({
                error: 'API key is required. Please set your Gemini API key in settings.'
            }, { status: 401 });
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

        // 识别不同类型的错误
        let errorType = 'general';
        let errorMessage = 'Failed to generate image';
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
