
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
  characters: string[];
  panels: ComicPanelData[];
  optimizedStory: string;
}

export const generateStoryPanels = async (
  storyText: string,
  keywords: string[] = []
): Promise<StoryGenerationResult> => {
  try {
    const response = await fetch('/api/generate-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ storyText, keywords }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate story');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating story:', error);
    throw error;
  }
};
