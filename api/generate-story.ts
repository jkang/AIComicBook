import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ComicPanelData {
    id: number;
    text: string;
    imagePrompt: string;
}

interface StoryResult {
    characters: string[];
    panels: ComicPanelData[];
    optimizedStory: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { storyText, keywords = [] } = req.body;

        if (!storyText) {
            return res.status(400).json({ error: 'Story text is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        // Use Google AI Studio API (not Vertex AI)
        const genAI = new GoogleGenerativeAI(apiKey);

        // Use Gemini 2.5 Flash - latest and best Flash model for text generation
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash'
        });

        // Determine panel count based on story length
        const charCount = storyText.length;
        const targetPanelCount = charCount <= 1500 ? '8-10' : '15-20';
        const maxPanels = charCount <= 1500 ? 10 : 20;

        // Craft the story optimization prompt
        const keywordsText = keywords.length > 0 ? `\nAdditional keywords/themes to emphasize: ${keywords.join(', ')}` : '';

        const prompt = `You are a master storyteller and comic book writer with expertise in visual narrative structure. Your task is to transform the user's story into an engaging, visually-rich comic book narrative.

USER'S STORY:
${storyText}
${keywordsText}

IMPORTANT LANGUAGE INSTRUCTION:
- Detect the language of the user's story text
- Output visualStyle, characters descriptions, and panel text in THE SAME LANGUAGE as the user's input
- ONLY the imagePrompt field should be in English (for image generation API)
- For example: If user writes in Chinese, output visualStyle and characters in Chinese, but imagePrompt in English

YOUR TASK:
1. **Design Visual Style**: Based on the story's theme, mood, and setting, create a unique visual style description IN THE USER'S INPUT LANGUAGE. This should be a concise statement (1-2 sentences) that defines:
   - Art style (e.g., "水彩儿童绘本风格" / "watercolor children's book style")
   - Color palette and mood (e.g., "温暖柔和色调" / "warm pastel tones")
   - Technical details (e.g., "柔和笔触" / "soft brush strokes")
   - Any cultural or thematic aesthetics

2. **Enhance the Story**: Transform this story into a captivating narrative with:
   - Rich sensory details and vivid descriptions
   - Strong character development and distinct personalities
   - Engaging dialogue and emotional depth
   - Clear narrative arc with tension and resolution
   - Visual moments that would translate well to comic panels

3. **Extract Key Characters**: Identify 3-5 main characters and provide detailed visual descriptions IN THE USER'S INPUT LANGUAGE for each:
   - Physical appearance (age, build, distinctive features)
   - Clothing/costume style
   - Key visual characteristics that make them recognizable
   - Personality traits that affect their visual presentation

4. **Create Comic Panels**: Break the enhanced story into ${targetPanelCount} panels (maximum ${maxPanels}). For each panel:
   - Write compelling narrative text (2-4 sentences) IN THE USER'S INPUT LANGUAGE
   - Create a detailed image generation prompt IN ENGLISH that includes:
     * The visual style you designed (translate to English if needed)
     * Scene description with specific visual elements
     * Character descriptions (translate to English if needed)
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
- ALL image prompts (imagePrompt field) must be in English
- ALL text/UI elements in images must be in English
- visualStyle, characters, and panel text should be in the SAME LANGUAGE as user's input

OUTPUT FORMAT (JSON):
{
  "visualStyle": "Visual style description in user's input language",
  "optimizedStory": "Brief summary in user's input language",
  "characters": [
    "Character 1 description in user's input language",
    "Character 2 description in user's input language",
    ...
  ],
  "panels": [
    {
      "id": 1,
      "text": "Panel narrative text in user's input language",
      "imagePrompt": "Detailed ENGLISH prompt for image generation"
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

        // Parse JSON response
        const storyResult: StoryResult = JSON.parse(text);

        // Validate and limit panel count
        if (storyResult.panels.length > maxPanels) {
            storyResult.panels = storyResult.panels.slice(0, maxPanels);
        }

        return res.status(200).json(storyResult);
    } catch (error: any) {
        console.error('Error generating story:', error);
        return res.status(500).json({
            error: 'Failed to generate story',
            details: error.message
        });
    }
}
