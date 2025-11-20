import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        // Enhance prompt for consistency (as a professional comic designer)
        const enhancedPrompt = enhanceComicPrompt(prompt);

        const genAI = new GoogleGenerativeAI(apiKey);

        // Use Gemini 2.5 Flash Image - best image generation model
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-image'
        });

        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{
                    text: enhancedPrompt
                }]
            }],
            generationConfig: {
                temperature: 0.4,
                candidateCount: 1,
            }
        });

        const response = result.response;
        const imageData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;

        if (!imageData || !imageData.data) {
            return res.status(500).json({ error: 'No image data received from API' });
        }

        res.json({
            image: `data:${imageData.mimeType};base64,${imageData.data}`
        });
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({
            error: 'Failed to generate image',
            details: error.message
        });
    }
});

/**
 * Enhance comic prompt for consistency
 * Professional comic designer best practices:
 * 1. Use story-specific visual style
 * 2. Character appearance consistency
 * 3. English text to avoid garbled characters
 * 4. Proper composition and lighting
 */
function enhanceComicPrompt(originalPrompt, storyVisualStyle = null) {
    // If prompt already looks complete (contains detailed style info), use as-is
    if (originalPrompt.length > 200 &&
        (originalPrompt.includes('style') || originalPrompt.includes('aesthetic'))) {
        return originalPrompt;
    }

    // Use story-specific visual style if provided, otherwise use a neutral base
    const visualStyle = storyVisualStyle ||
        "comic book art style, cel-shaded, intricate details, atmospheric lighting, 4k resolution";

    // Additional professional guidelines
    const guidelines = [
        "Use English for any text or UI elements in the image to avoid garbled characters.",
        "Maintain consistent character appearances if characters are mentioned.",
        "Apply cinematic composition with clear focal points.",
        "Ensure proper depth and atmospheric perspective."
    ].join(' ');

    // Combine: Visual Style + Original Prompt + Guidelines
    return `${visualStyle}. ${originalPrompt} ${guidelines}`;
}

// Generate Story endpoint
app.post('/api/generate-story', async (req, res) => {
    try {
        const { storyText, keywords = [] } = req.body;

        if (!storyText) {
            return res.status(400).json({ error: 'Story text is required' });
        }

        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Use Gemini 2.5 Flash - latest and best Flash model for text generation
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash'
        });

        const charCount = storyText.length;
        const targetPanelCount = charCount <= 1500 ? '8-10' : '15-20';
        const maxPanels = charCount <= 1500 ? 10 : 20;

        const keywordsText = keywords.length > 0 ? `\nAdditional keywords/themes to emphasize: ${keywords.join(', ')}` : '';

        const prompt = `You are a master storyteller and comic book writer with expertise in visual narrative structure. Your task is to transform the user's story into an engaging, visually-rich comic book narrative.

USER'S STORY:
${storyText}
${keywordsText}

YOUR TASK:
1. **Design Visual Style**: Based on the story's theme, mood, and setting, create a unique visual style description. This should be a concise statement (1-2 sentences) that defines:
   - Art style (e.g., "watercolor children's book style", "noir comic book art", "anime-inspired manga style", "realistic graphic novel style")
   - Color palette and mood (e.g., "warm pastel tones", "high contrast shadows", "vibrant saturated colors")
   - Technical details (e.g., "soft brush strokes", "cel-shaded", "detailed line work")
   - Any cultural or thematic aesthetics (e.g., "traditional Chinese ink painting influence", "retro-futuristic", "fantasy medieval")

2. **Enhance the Story**: Transform this story into a captivating narrative with:
   - Rich sensory details and vivid descriptions
   - Strong character development and distinct personalities
   - Engaging dialogue and emotional depth
   - Clear narrative arc with tension and resolution
   - Visual moments that would translate well to comic panels

3. **Extract Key Characters**: Identify 3-5 main characters and provide detailed visual descriptions for each:
   - Physical appearance (age, build, distinctive features)
   - Clothing/costume style
   - Key visual characteristics that make them recognizable
   - Personality traits that affect their visual presentation

4. **Create Comic Panels**: Break the enhanced story into ${targetPanelCount} panels (maximum ${maxPanels}). For each panel:
   - Write compelling narrative text (2-4 sentences) in the story's original language
   - Create a detailed image generation prompt in English that includes:
     * The visual style you designed (reference it consistently)
     * Scene description with specific visual elements
     * Character descriptions (reference the characters you extracted)
     * Mood and atmosphere
     * Camera angle/composition suggestions
     * Any text/UI elements should be in ENGLISH to avoid garbled characters

IMPORTANT GUIDELINES:
- The visual style should match the story's tone (e.g., children's story = soft, warm; thriller = dark, dramatic)
- Each panel should advance the story meaningfully
- Balance action, dialogue, and emotional moments
- Ensure visual variety across panels (different angles, settings, compositions)
- Make image prompts specific and detailed for consistent character appearance
- Keep narrative text concise but impactful
- ALL image prompts must be in English
- ALL text/UI elements in images must be in English

OUTPUT FORMAT (JSON):
{
  "visualStyle": "Concise visual style description that will be used for all panels in this story",
  "optimizedStory": "Brief summary of the enhanced story",
  "characters": [
    "Character 1: [Name] - [Detailed visual description]",
    "Character 2: [Name] - [Detailed visual description]",
    ...
  ],
  "panels": [
    {
      "id": 1,
      "text": "Panel narrative text in the story's original language",
      "imagePrompt": "Detailed English prompt starting with the visual style, then scene, characters, and mood"
    },
    ...
  ]
}

Generate the JSON now:`;

        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.8,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192,
                responseMimeType: 'application/json',
            },
        });

        const response = result.response;
        const text = response.text();

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
