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

        // Use Gemini 1.5 Flash for cost efficiency (cheaper than 2.0 Flash Exp)
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash-latest'
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

YOUR TASK:
1. **Enhance the Story**: Transform this story into a captivating narrative with:
   - Rich sensory details and vivid descriptions
   - Strong character development and distinct personalities
   - Engaging dialogue and emotional depth
   - Clear narrative arc with tension and resolution
   - Visual moments that would translate well to comic panels

2. **Extract Key Characters**: Identify 3-5 main characters and provide detailed visual descriptions for each:
   - Physical appearance (age, build, distinctive features)
   - Clothing/costume style
   - Key visual characteristics that make them recognizable
   - Personality traits that affect their visual presentation

3. **Create Comic Panels**: Break the enhanced story into ${targetPanelCount} panels (maximum ${maxPanels}). For each panel:
   - Write compelling narrative text (2-4 sentences)
   - Create a detailed image generation prompt in English that includes:
     * Visual style: "comic book art style, retro-futuristic aesthetics, cel-shaded, intricate details, atmospheric lighting, 4k resolution"
     * Scene description with specific visual elements
     * Character descriptions (reference the characters you extracted)
     * Mood and atmosphere
     * Camera angle/composition suggestions

IMPORTANT GUIDELINES:
- Each panel should advance the story meaningfully
- Balance action, dialogue, and emotional moments
- Ensure visual variety across panels (different angles, settings, compositions)
- Make image prompts specific and detailed for consistent character appearance
- Keep narrative text concise but impactful

OUTPUT FORMAT (JSON):
{
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
      "imagePrompt": "Detailed English prompt for image generation including style, scene, characters, and mood"
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
