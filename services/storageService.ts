
import { get, set, del, keys } from 'idb-keyval';

// New prefix format: img_{storyId}_{panelId}
// Old prefix format: comic_panel_img_{panelId} (treated as storyId='default')
const IMG_PREFIX = 'img_';
const OLD_IMG_PREFIX = 'comic_panel_img_';

export const saveImageToDB = async (storyId: string, panelId: number, base64Image: string): Promise<void> => {
  await set(`${IMG_PREFIX}${storyId}_${panelId}`, base64Image);
};

export const getImageFromDB = async (storyId: string, panelId: number): Promise<string | undefined> => {
  return await get<string>(`${IMG_PREFIX}${storyId}_${panelId}`);
};

export const getAllImagesFromDB = async (): Promise<Record<string, string>> => {
  const allKeys = await keys();
  const images: Record<string, string> = {};

  for (const key of allKeys) {
    if (typeof key !== 'string') continue;

    if (key.startsWith(IMG_PREFIX)) {
      // New format: img_{storyId}_{panelId} -> key in state: {storyId}_{panelId}
      const cleanKey = key.replace(IMG_PREFIX, '');
      const val = await get<string>(key);
      if (val) images[cleanKey] = val;
    } else if (key.startsWith(OLD_IMG_PREFIX)) {
      // Old format: comic_panel_img_{panelId} -> key in state: default_{panelId}
      const id = parseInt(key.replace(OLD_IMG_PREFIX, ''), 10);
      if (!isNaN(id)) {
        const val = await get<string>(key);
        if (val) images[`default_${id}`] = val;
      }
    }
  }

  return images;
};

export const clearAllImagesFromDB = async (): Promise<void> => {
  const allKeys = await keys();
  for (const key of allKeys) {
    if (typeof key === 'string' && (key.startsWith(IMG_PREFIX) || key.startsWith(OLD_IMG_PREFIX))) {
      await del(key);
    }
  }
};

// Text storage
const TEXT_PREFIX = 'text_';
const OLD_TEXT_PREFIX = 'comic_panel_text_';

export const saveTextToDB = async (storyId: string, panelId: number, text: string): Promise<void> => {
  await set(`${TEXT_PREFIX}${storyId}_${panelId}`, text);
};

export const getAllTextsFromDB = async (): Promise<Record<string, string>> => {
  const allKeys = await keys();
  const texts: Record<string, string> = {};

  for (const key of allKeys) {
    if (typeof key !== 'string') continue;

    if (key.startsWith(TEXT_PREFIX)) {
      const cleanKey = key.replace(TEXT_PREFIX, '');
      const val = await get<string>(key);
      if (val) texts[cleanKey] = val;
    } else if (key.startsWith(OLD_TEXT_PREFIX)) {
      const id = parseInt(key.replace(OLD_TEXT_PREFIX, ''), 10);
      if (!isNaN(id)) {
        const val = await get<string>(key);
        if (val) texts[`default_${id}`] = val;
      }
    }
  }

  return texts;
};

export const clearAllTextsFromDB = async (): Promise<void> => {
  const allKeys = await keys();
  for (const key of allKeys) {
    if (typeof key === 'string' && (key.startsWith(TEXT_PREFIX) || key.startsWith(OLD_TEXT_PREFIX))) {
      await del(key);
    }
  }
};

const STORY_PREFIX = 'custom_story_';

export const saveStoryToDB = async (story: any): Promise<void> => {
  await set(`${STORY_PREFIX}${story.id}`, story);
};

export const getAllStoriesFromDB = async (): Promise<any[]> => {
  const allKeys = await keys();
  const storyKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith(STORY_PREFIX));

  const stories: any[] = [];

  for (const key of storyKeys) {
    const story = await get<any>(key);
    if (story) {
      stories.push(story);
    }
  }

  // Sort by creation date, newest first
  return stories.sort((a, b) => b.createdAt - a.createdAt);
};

export const deleteStoryFromDB = async (storyId: string): Promise<void> => {
  await del(`${STORY_PREFIX}${storyId}`);
};
