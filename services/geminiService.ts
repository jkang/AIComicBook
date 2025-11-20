
import { ComicPanelData } from '../types';
import { getApiKey } from './apiKeyService';
import { GoogleGenAI } from "@google/genai";
import { enhanceComicPrompt } from '../shared/gemini-helper';

export const generateComicPanelImage = async (prompt: string): Promise<string> => {
  try {
    const apiKey = getApiKey();

    // 如果用户有自己的 API key，直接在前端调用 Gemini API
    if (apiKey) {
      console.log('🔑 Using user API key (client-side)');

      // 增强提示词
      const enhancedPrompt = enhanceComicPrompt(prompt);

      // 直接调用 Gemini API
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: enhancedPrompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      // 提取图片数据
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
        throw new Error('No image data received from API');
      }

      return `data:image/png;base64,${imageBase64}`;
    }

    // 如果没有用户 API key，使用后端 API（需要服务器配置环境变量）
    console.log('🌐 Using server API key (server-side)');
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

    const apiKey = getApiKey();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // 如果用户有自己的 API key，添加到请求头
    if (apiKey) {
      headers['x-gemini-api-key'] = apiKey;
    }

    const response = await fetch('/api/generate-story', {
      method: 'POST',
      headers,
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
