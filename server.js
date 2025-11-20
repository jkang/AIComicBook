import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI as GoogleGenAI_New } from "@google/genai";
import { enhanceComicPrompt, generateStoryPrompt } from './shared/gemini-helper.js';

dotenv.config({ path: '.env.local' });

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn('⚠️  Warning: GEMINI_API_KEY not found in .env.local');
}

// Generate Image endpoint
app.post('/api/generate-image', async (req, res) => {
    try {
        const { prompt } = req.body;

        console.log('📸 Image generation request received');
        console.log('Prompt length:', prompt?.length);

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        if (!apiKey) {
            console.error('❌ API key not configured');
            return res.status(500).json({ error: 'API key not configured' });
        }

        // Enhance prompt for consistency using shared helper
        const enhancedPrompt = enhanceComicPrompt(prompt);
        console.log('Enhanced prompt:', enhancedPrompt.substring(0, 200) + '...');

        // Use the new SDK for Gemini 2.5 Flash Image
        console.log('Using model: gemini-2.5-flash-image with @google/genai SDK');

        const ai = new GoogleGenAI_New({ apiKey: apiKey });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: enhancedPrompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        console.log('Response received from new SDK');

        // Handle the response to find image data
        let imageBase64 = null;

        // The response structure in the new SDK might be slightly different
        // Based on user example: response.parts -> part.inlineData
        if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    imageBase64 = part.inlineData.data;
                    break;
                }
            }
        }

        if (!imageBase64) {
            console.error('❌ No image data in response');
            // Log the full response for debugging
            console.log(JSON.stringify(response, null, 2));
            return res.status(500).json({ error: 'No image data received from API' });
        }

        console.log('✅ Image generated successfully');
        res.json({
            image: `data:image/png;base64,${imageBase64}`
        });
    } catch (error) {
        console.error('❌ Error generating image:', error);
        res.status(500).json({
            error: 'Failed to generate image',
            details: error.message
        });
    }
});

// Generate Story endpoint
app.post('/api/generate-story', async (req, res) => {
    try {
        const { storyText, keywords = [], language = 'en' } = req.body;

        if (!storyText) {
            return res.status(400).json({ error: 'Story text is required' });
        }

        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        // Use the new SDK
        const ai = new GoogleGenAI_New({ apiKey: apiKey });

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
            throw new Error("No text generated");
        }

        const storyResult = JSON.parse(text);

        if (storyResult.panels.length > maxPanels) {
            storyResult.panels = storyResult.panels.slice(0, maxPanels);
        }

        res.json(storyResult);
    } catch (error) {
        console.error('Error generating story:', error);
        res.status(500).json({
            error: 'Failed to generate story',
            details: error.message
        });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
    if (apiKey) {
        console.log('✅ GEMINI_API_KEY loaded');
    } else {
        console.log('⚠️  GEMINI_API_KEY not found - API calls will fail');
    }
});
