
import { ComicPanelData } from '../types';

export const generateComicPanelImage = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate image');
    }

    const data = await response.json();
    return data.image;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};

export interface StoryGenerationResult {
  visualStyle: string;
  characters: string[];
  panels: ComicPanelData[];
  optimizedStory: string;
}

export const generateStoryPanels = async (
  storyText: string,
  keywords: string[] = [],
  manualLanguage: 'auto' | 'zh' | 'en' = 'auto'
): Promise<StoryGenerationResult> => {
  try {
    let detectedLanguage: string;

    if (manualLanguage === 'auto') {
      // Auto-detect language
      const { detectUserInputLanguage } = await import('../utils/languageDetection');
      detectedLanguage = detectUserInputLanguage(storyText);
    } else {
      // Use manually selected language
      detectedLanguage = manualLanguage;
    }

    const response = await fetch('/api/generate-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storyText,
        keywords,
        language: detectedLanguage
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate story');
    }

    const data = await response.json();

    // Normalize characters if they are objects (AI sometimes returns objects despite prompt)
    if (Array.isArray(data.characters)) {
      data.characters = data.characters.map((char: any) => {
        if (typeof char === 'object' && char !== null) {
          // If it's an object like { name: "...", description: "..." }
          const name = char.name || char.Name || '';
          const desc = char.description || char.Description || char.desc || '';
          if (name && desc) return `${name}: ${desc}`;
          if (name) return name;
          if (desc) return desc;
          return JSON.stringify(char); // Fallback
        }
        return String(char);
      });
    }

    return data;
  } catch (error) {
    console.error('Error generating story:', error);
    throw error;
  }
};
