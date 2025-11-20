/**
 * API Key 管理服务
 * 使用 localStorage 存储用户的 Gemini API key
 */

const API_KEY_STORAGE_KEY = 'gemini_api_key';

/**
 * 保存 API key 到 localStorage
 */
export const saveApiKey = (apiKey: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
  } catch (error) {
    console.error('Failed to save API key:', error);
    throw new Error('无法保存 API key');
  }
};

/**
 * 从 localStorage 获取 API key
 */
export const getApiKey = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to get API key:', error);
    return null;
  }
};

/**
 * 删除 API key
 */
export const removeApiKey = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to remove API key:', error);
  }
};

/**
 * 检查是否有 API key
 */
export const hasApiKey = (): boolean => {
  const apiKey = getApiKey();
  return apiKey !== null && apiKey.trim().length > 0;
};

/**
 * 验证 API key 格式（基本验证）
 */
export const validateApiKey = (apiKey: string): { valid: boolean; error?: string } => {
  if (!apiKey || apiKey.trim().length === 0) {
    return { valid: false, error: 'API key 不能为空' };
  }
  
  // Gemini API key 通常以 "AI" 开头
  if (!apiKey.startsWith('AI')) {
    return { valid: false, error: 'API key 格式不正确，应该以 "AI" 开头' };
  }
  
  // 基本长度检查
  if (apiKey.length < 20) {
    return { valid: false, error: 'API key 长度不正确' };
  }
  
  return { valid: true };
};

