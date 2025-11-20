/**
 * Enhance comic prompt for consistency
 * Professional comic designer best practices:
 * 1. Use story-specific visual style
 * 2. Character appearance consistency
 * 3. English text to avoid garbled characters
 * 4. Proper composition and lighting
 */
export function enhanceComicPrompt(originalPrompt, storyVisualStyle = null) {
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

/**
 * Generate prompt for story creation
 */
export function generateStoryPrompt(storyText, keywords = [], language = 'en') {
    const keywordsText = keywords.length > 0 ? `\nAdditional keywords/themes to emphasize: ${keywords.join(', ')}` : '';

    // Map language codes to full names
    const languageNames = {
        'zh': 'Chinese',
        'en': 'English',
        'ja': 'Japanese',
        'ko': 'Korean'
    };
    const languageName = languageNames[language] || 'English';

    // Determine panel count based on story length
    const charCount = storyText.length;
    const targetPanelCount = charCount <= 1500 ? '8-10' : '15-20';
    const maxPanels = charCount <= 1500 ? 10 : 20;

    const prompt = `You are a master storyteller and comic book writer with expertise in visual narrative structure. Your task is to transform the user's story into an engaging, visually-rich comic book narrative.

USER'S STORY:
${storyText}
${keywordsText}

IMPORTANT LANGUAGE INSTRUCTION:
- The user's input language is: **${languageName}**
- Output visualStyle, characters descriptions, optimizedStory, and panel text in **${languageName}**
- ONLY the imagePrompt field should be in English (for image generation API)
- Example: If language is Chinese, output visualStyle and characters in Chinese, but imagePrompt in English

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
   - **AGE-APPROPRIATE CONTENT**: Analyze the story to determine the target age group (e.g., 3-5 years, 6-8 years, 9-12 years, 12+ teens/adults)
   - **VOCABULARY MATCHING**: Use vocabulary and sentence complexity appropriate for the target age:
     * Ages 3-5: Simple words (10-15 characters max), short sentences (5-8 words), concrete concepts
     * Ages 6-8: Basic vocabulary, medium sentences (8-12 words), simple emotions
     * Ages 9-12: Moderate vocabulary, varied sentence length, complex emotions
     * Ages 12+ (Teens/Adults): Advanced vocabulary, complex sentences, abstract concepts, mature themes

3. **Extract Key Characters**: Identify 3-5 main characters and provide detailed visual descriptions IN THE USER'S INPUT LANGUAGE for each:
   - Physical appearance (age, build, distinctive features) - **MATCH CHARACTER AGE TO TARGET AUDIENCE**
   - Clothing/costume style appropriate for character age
   - Key visual characteristics that make them recognizable
   - Personality traits that affect their visual presentation
   - **For children's stories**: Characters should be relatable to the target age group

4. **Create Comic Panels**: Break the enhanced story into ${targetPanelCount} panels (maximum ${maxPanels}). For each panel:
   - Write compelling narrative text (2-4 sentences) IN THE USER'S INPUT LANGUAGE
   - **USE AGE-APPROPRIATE LANGUAGE**: Match vocabulary and complexity to target age group
   - Create a detailed image generation prompt IN ENGLISH that includes:
     * The visual style you designed (translate to English if needed)
     * Scene description with specific visual elements
     * Character descriptions with AGE-SPECIFIC details (e.g., "5-year-old girl" not just "girl")
     * Mood and atmosphere
     * Camera angle/composition suggestions
     * Any text/UI elements should be in ENGLISH to avoid garbled characters

IMPORTANT GUIDELINES:
- **CRITICAL**: Analyze character ages and target audience from the story context
- **VOCABULARY**: For young children (under 8), use ONLY simple, everyday words
- **SENTENCE STRUCTURE**: Shorter sentences for younger audiences, more complex for older
- **THEMES**: Age-appropriate themes and conflict resolution
- The visual style should match the story's tone AND age group
- Each panel should advance the story meaningfully
- Balance action, dialogue, and emotional moments appropriate for age
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

    return { prompt, maxPanels };
}
