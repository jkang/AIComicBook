/**
 * Detect the primary language of the input text
 * Returns language code: 'zh' (Chinese), 'en' (English), 'ja' (Japanese), etc.
 */
export function detectUserInputLanguage(text: string): string {
    if (!text || text.trim().length === 0) {
        return 'en'; // Default to English
    }

    // Count characters by type
    let chineseCount = 0;
    let japaneseCount = 0;
    let koreanCount = 0;
    let latinCount = 0;

    for (const char of text) {
        const code = char.charCodeAt(0);

        // Chinese characters (CJK Unified Ideographs)
        if ((code >= 0x4E00 && code <= 0x9FFF) ||
            (code >= 0x3400 && code <= 0x4DBF)) {
            chineseCount++;
        }
        // Japanese Hiragana and Katakana
        else if ((code >= 0x3040 && code <= 0x309F) ||
            (code >= 0x30A0 && code <= 0x30FF)) {
            japaneseCount++;
        }
        // Korean Hangul
        else if (code >= 0xAC00 && code <= 0xD7AF) {
            koreanCount++;
        }
        // Latin alphabet
        else if ((code >= 0x0041 && code <= 0x005A) ||
            (code >= 0x0061 && code <= 0x007A)) {
            latinCount++;
        }
    }

    // Determine language based on character counts
    const total = chineseCount + japaneseCount + koreanCount + latinCount;

    if (total === 0) {
        return 'en';
    }

    // Calculate percentages
    const chinesePercent = chineseCount / total;
    const japanesePercent = japaneseCount / total;
    const koreanPercent = koreanCount / total;
    const latinPercent = latinCount / total;

    // Return language with highest percentage (threshold: 20%)
    if (chinesePercent > 0.2) return 'zh';
    if (japanesePercent > 0.2) return 'ja';
    if (koreanPercent > 0.2) return 'ko';
    if (latinPercent > 0.3) return 'en';

    // Default to English if no clear majority
    return 'en';
}

/**
 * Get language name for display
 */
export function getLanguageName(code: string): string {
    const names: Record<string, string> = {
        'zh': 'Chinese',
        'en': 'English',
        'ja': 'Japanese',
        'ko': 'Korean',
    };
    return names[code] || 'English';
}
