
import { get, set, del, keys } from 'idb-keyval';

const PREFIX = 'comic_panel_img_';

export const saveImageToDB = async (panelId: number, base64Image: string): Promise<void> => {
  await set(`${PREFIX}${panelId}`, base64Image);
};

export const getImageFromDB = async (panelId: number): Promise<string | undefined> => {
  return await get<string>(`${PREFIX}${panelId}`);
};

export const getAllImagesFromDB = async (): Promise<Record<number, string>> => {
  const allKeys = await keys();
  const imageKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith(PREFIX));

  const images: Record<number, string> = {};

  for (const key of imageKeys) {
    const id = parseInt((key as string).replace(PREFIX, ''), 10);
    if (!isNaN(id)) {
      const val = await get<string>(key);
      if (val) {
        images[id] = val;
      }
    }
  }

  return images;
};

export const clearAllImagesFromDB = async (): Promise<void> => {
  const allKeys = await keys();
  const imageKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith(PREFIX));
  for (const key of imageKeys) {
    await del(key);
  }
};

const TEXT_PREFIX = 'comic_panel_text_';

export const saveTextToDB = async (panelId: number, text: string): Promise<void> => {
  await set(`${TEXT_PREFIX}${panelId}`, text);
};

export const getAllTextsFromDB = async (): Promise<Record<number, string>> => {
  const allKeys = await keys();
  const textKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith(TEXT_PREFIX));

  const texts: Record<number, string> = {};

  for (const key of textKeys) {
    const id = parseInt((key as string).replace(TEXT_PREFIX, ''), 10);
    if (!isNaN(id)) {
      const val = await get<string>(key);
      if (val) {
        texts[id] = val;
      }
    }
  }

  return texts;
};

export const clearAllTextsFromDB = async (): Promise<void> => {
  const allKeys = await keys();
  const textKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith(TEXT_PREFIX));
  for (const key of textKeys) {
    await del(key);
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
