import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

        // Use Google AI Studio API (not Vertex AI)
        const genAI = new GoogleGenerativeAI(apiKey);

        // Use Imagen 3 for image generation (more cost-effective than Imagen 4)
        const model = genAI.getGenerativeModel({
            model: 'imagen-3.0-generate-001'
        });

        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.4,
                candidateCount: 1,
            }
        });

        // Extract image from response
        const response = result.response;
        const imageData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;

        if (!imageData || !imageData.data) {
            return res.status(500).json({ error: 'No image data received from API' });
        }

        return res.status(200).json({
            image: `data:${imageData.mimeType};base64,${imageData.data}`
        });
    } catch (error: any) {
        console.error('Error generating image:', error);
        return res.status(500).json({
            error: 'Failed to generate image',
            details: error.message
        });
    }
}
