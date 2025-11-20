
import { ComicPanelData } from '../types';
import { getApiKey } from './apiKeyService';

export const generateComicPanelImage = async (
  prompt: string,
  visualStyle?: string,
  characters?: string[]
): Promise<string> => {
  try {
    // 从 localStorage 读取用户的 API key
    const apiKey = getApiKey();

    // 调用后端 API，将 API key 放在 body 中传递
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        apiKey, // API key 放在 body 中，而不是 header
        visualStyle, // 传递视觉风格
        characters // 传递角色描述
      }),
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

    // 从 localStorage 读取用户的 API key（可选）
    // 如果用户没有设置 API key，后端会使用环境变量的 key
    const apiKey = getApiKey();

    // 调用后端 API，将 API key 放在 body 中传递（如果有的话）
    const response = await fetch('/api/generate-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storyText,
        keywords,
        language: detectedLanguage,
        apiKey: apiKey || undefined // 如果没有用户 key，传 undefined，后端会使用环境变量
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
