import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { createImagePromptGenerationPrompt, enhanceComicPromptSimple } from '../../../shared/gemini-helper';

/**
 * Generate final image prompt using AI
 * @param ai - GoogleGenAI instance
 * @param visualStyle - Visual style description (can be in any language)
 * @param characters - Array of character descriptions (can be in any language)
 * @param panelText - The narrative text for this panel (can be in any language)
 * @param prompt - The scene description from panel.imagePrompt
 * @returns Professional English image generation prompt
 */
async function generateFinalImagePrompt(
    ai: GoogleGenAI,
    visualStyle: string,
    characters: string[],
    panelText: string,
    prompt: string
): Promise<string> {
    try {
        // Step 1: Use Gemini 2.0 Flash to generate professional English image prompt
        const promptGenerationPrompt = createImagePromptGenerationPrompt(
            visualStyle || '',
            characters || [],
            panelText || '',
            prompt
        );

        const promptResponse = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: promptGenerationPrompt,
            config: {
                temperature: 0.7,
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 500,
            }
        });

        let generatedPrompt = "";
        if (promptResponse.candidates && promptResponse.candidates[0] &&
            promptResponse.candidates[0].content && promptResponse.candidates[0].content.parts) {
            for (const part of promptResponse.candidates[0].content.parts) {
                if (part.text) {
                    generatedPrompt += part.text;
                }
            }
        }

        // Clean up the response (remove quotes if present)
        const enhancedPrompt = generatedPrompt.trim().replace(/^["']|["']$/g, '');
        console.log('✨ [generate-image] AI-generated prompt:', enhancedPrompt);
        return enhancedPrompt;
    } catch (aiError) {
        // Fallback to simple enhancement if AI call fails
        console.warn('⚠️ [generate-image] AI prompt generation failed, using fallback:', aiError);
        const fallbackPrompt = enhanceComicPromptSimple(prompt, visualStyle || '', characters || []);
        console.log('📋 [generate-image] Fallback prompt:', fallbackPrompt);
        return fallbackPrompt;
    }
}

export async function POST(req: Request) {
    try {
        const { prompt, apiKey, visualStyle, characters, panelText } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // 要求用户必须提供 API key
        if (!apiKey) {
            return NextResponse.json({
                error: 'API key is required. Please set your Gemini API key in settings.'
            }, { status: 401 });
        }

        const ai = new GoogleGenAI({ apiKey });

        // Generate final image prompt using AI (server-side)
        // This will translate and naturally integrate visualStyle, characters, and scene description
        const enhancedPrompt = await generateFinalImagePrompt(
            ai,
            visualStyle || '',
            characters || [],
            panelText || '',
            prompt
        );

        // Step 2: Use Gemini 2.5 Flash Image to generate the actual image
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
            console.error('❌ [generate-image] No image data in response');
            return NextResponse.json({ error: 'No image data received from API' }, { status: 500 });
        }

        return NextResponse.json({
            image: `data:image/png;base64,${imageBase64}`
        });
    } catch (error: any) {
        console.error('❌ [generate-image] Error:', error.message);

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
