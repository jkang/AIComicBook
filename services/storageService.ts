
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
