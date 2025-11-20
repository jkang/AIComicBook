import React, { useState } from 'react';
import { generateStoryPanels } from '../services/geminiService';
import { Story, ComicPanelData } from '../types';

interface AddStoryProps {
    onSave: (story: Story) => void;
    onCancel: () => void;
}

const AddStory: React.FC<AddStoryProps> = ({ onSave, onCancel }) => {
    const [storyText, setStoryText] = useState(`宝宝名字叫朵朵
是一个爱美的小姑娘
有的时候和幼儿园的小朋友会发生小冲突
帮我创作一个温馨的好朋友之间冲突再和好的绘本`);
    const [keywords, setKeywords] = useState('温馨, 童趣');
    const [title, setTitle] = useState('给5岁女儿的绘本');
    const [selectedLanguage, setSelectedLanguage] = useState<'auto' | 'zh' | 'en'>('auto');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedResult, setGeneratedResult] = useState<{
        visualStyle: string;
        characters: string[];
        panels: ComicPanelData[];
        optimizedStory: string;
    } | null>(null);

    const charCount = storyText.length;
    const maxChars = 10000;

    const handleGenerate = async () => {
        if (!storyText.trim()) {
            setError('请输入故事内容');
            return;
        }

        if (!title.trim()) {
            setError('请输入故事标题');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const keywordArray = keywords
                .split(',')
                .map(k => k.trim())
                .filter(k => k.length > 0);

            const result = await generateStoryPanels(storyText, keywordArray, selectedLanguage);
            setGeneratedResult(result);
        } catch (err: any) {
            // Improved error handling
            let errorMessage = '生成失败，请稍后重试';

            if (err.message?.includes('fetch') || err.message?.includes('Failed to fetch')) {
                errorMessage = '无法连接到服务器。请确保：\n1. 已启动本地服务器（使用 vercel dev）\n2. 或已部署到 Vercel 并设置了 GEMINI_API_KEY 环境变量';
            } else if (err.message?.includes('API key')) {
                errorMessage = 'API Key 未配置或无效。请在环境变量中设置 GEMINI_API_KEY';
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = () => {
        if (!generatedResult) return;

        const story: Story = {
            id: `story_${Date.now()}`,
            title: title.trim(),
            panels: editedPanels || generatedResult.panels,
            characters: editedCharacters || generatedResult.characters,
            visualStyle: editedVisualStyle || generatedResult.visualStyle,
            createdAt: Date.now(),
        };

        onSave(story);
    };

    const handleRegenerate = () => {
        setGeneratedResult(null);
        setEditedVisualStyle(null);
        setEditedCharacters(null);
        setEditedPanels(null);
    };

    // Editable state
    const [editedVisualStyle, setEditedVisualStyle] = useState<string | null>(null);
    const [editedCharacters, setEditedCharacters] = useState<string[] | null>(null);
    const [editedPanels, setEditedPanels] = useState<ComicPanelData[] | null>(null);
    const [editingVisualStyle, setEditingVisualStyle] = useState(false);
    const [editingCharacters, setEditingCharacters] = useState(false);
    const [editingPanels, setEditingPanels] = useState(false);

    // Initialize edited state when result changes
    React.useEffect(() => {
        if (generatedResult) {
            setEditedVisualStyle(generatedResult.visualStyle);
            setEditedCharacters([...generatedResult.characters]);
            setEditedPanels(generatedResult.panels.map(p => ({ ...p })));
        }
    }, [generatedResult]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-indigo-400">创建新故事</h1>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {!generatedResult ? (
                    /* Input Form */
                    <div className="space-y-6">
                        {/* Title Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                故事标题 *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="给你的故事起个名字..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
                                maxLength={100}
                            />
                        </div>

                        {/* Story Text Input */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    故事内容 *
                                </label>
                                <span className={`text-sm ${charCount > maxChars ? 'text-red-400' : 'text-gray-500'}`}>
                                    {charCount} / {maxChars}
                                </span>
                            </div>
                            <textarea
                                value={storyText}
                                onChange={(e) => setStoryText(e.target.value)}
                                placeholder="输入你的故事... 
                
提示：
• 1500字以内：生成8-10个分镜
• 1500字以上：生成15-20个分镜
• 最多支持10000字
• AI会自动优化你的故事，添加细节和视觉描述"
                                className="w-full h-64 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                                maxLength={maxChars}
                            />
                        </div>

                        {/* Keywords Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                关键词 (可选)
                            </label>
                            <input
                                type="text"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                placeholder="用逗号分隔，例如：科幻, 悬疑, 温馨"
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                关键词将帮助AI更好地理解你想要的故事风格
                            </p>
                        </div>

                        {/* Language Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                输出语言
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedLanguage('auto')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedLanguage === 'auto'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                                        }`}
                                >
                                    自动检测
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedLanguage('zh')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedLanguage === 'zh'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                                        }`}
                                >
                                    中文
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedLanguage('en')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedLanguage === 'en'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                                        }`}
                                >
                                    English
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                选择故事内容的输出语言（图片提示词始终为英文）
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300">
                                <div className="flex items-start gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="whitespace-pre-line text-sm">{error}</div>
                                </div>
                            </div>
                        )}

                        {/* Generate Button */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !storyText.trim() || !title.trim() || charCount > maxChars}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>AI 正在创作...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span>生成分镜</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={onCancel}
                                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                取消
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Preview Generated Story */
                    <div className="space-y-6">
                        {/* Visual Style - Editable */}
                        {(editedVisualStyle || generatedResult.visualStyle) && (
                            <div className="bg-gray-800 border border-indigo-700 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-xl font-bold text-indigo-400">🎨 视觉风格</h2>
                                    <button
                                        onClick={() => setEditingVisualStyle(!editingVisualStyle)}
                                        className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                                    >
                                        {editingVisualStyle ? '取消' : '编辑'}
                                    </button>
                                </div>
                                {editingVisualStyle ? (
                                    <div className="space-y-2">
                                        <textarea
                                            value={editedVisualStyle || ''}
                                            onChange={(e) => setEditedVisualStyle(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-300 text-sm focus:outline-none focus:border-indigo-500"
                                            rows={3}
                                        />
                                        <button
                                            onClick={() => setEditingVisualStyle(false)}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-1 rounded transition-colors"
                                        >
                                            保存
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-gray-300 text-sm italic leading-relaxed">
                                        {editedVisualStyle}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Characters - Editable */}
                        {editedCharacters && editedCharacters.length > 0 && (
                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-indigo-400">主要角色</h2>
                                    <button
                                        onClick={() => setEditingCharacters(!editingCharacters)}
                                        className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                                    >
                                        {editingCharacters ? '取消' : '编辑'}
                                    </button>
                                </div>
                                {editingCharacters ? (
                                    <div className="space-y-3">
                                        {editedCharacters.map((char, idx) => (
                                            <div key={idx} className="space-y-1">
                                                <label className="text-xs text-gray-500">角色 {idx + 1}</label>
                                                <textarea
                                                    value={char}
                                                    onChange={(e) => {
                                                        const newChars = [...editedCharacters];
                                                        newChars[idx] = e.target.value;
                                                        setEditedCharacters(newChars);
                                                    }}
                                                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-300 text-sm focus:outline-none focus:border-indigo-500"
                                                    rows={2}
                                                />
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => setEditingCharacters(false)}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-1 rounded transition-colors"
                                        >
                                            保存
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {editedCharacters.map((char, idx) => (
                                            <div key={idx} className="text-gray-300 text-sm">
                                                • {char}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Panels Preview - Editable */}
                        {editedPanels && editedPanels.length > 0 && (
                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-indigo-400">
                                        分镜预览 ({editedPanels.length} 个)
                                    </h2>
                                    <button
                                        onClick={() => setEditingPanels(!editingPanels)}
                                        className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                                    >
                                        {editingPanels ? '取消' : '编辑'}
                                    </button>
                                </div>
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {editedPanels.map((panel, idx) => (
                                        <div key={panel.id} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-indigo-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                    {idx + 1}
                                                </div>
                                                {editingPanels ? (
                                                    <div className="flex-1 space-y-2">
                                                        <div>
                                                            <label className="text-xs text-gray-500">分镜文本</label>
                                                            <textarea
                                                                value={panel.text}
                                                                onChange={(e) => {
                                                                    const newPanels = [...editedPanels];
                                                                    newPanels[idx].text = e.target.value;
                                                                    setEditedPanels(newPanels);
                                                                }}
                                                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-300 text-sm focus:outline-none focus:border-indigo-500 mt-1"
                                                                rows={3}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-gray-500">图片提示词 (英文)</label>
                                                            <textarea
                                                                value={panel.imagePrompt}
                                                                onChange={(e) => {
                                                                    const newPanels = [...editedPanels];
                                                                    newPanels[idx].imagePrompt = e.target.value;
                                                                    setEditedPanels(newPanels);
                                                                }}
                                                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-300 text-sm focus:outline-none focus:border-indigo-500 mt-1"
                                                                rows={4}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex-1">
                                                        <p className="text-gray-300 text-sm leading-relaxed mb-2">{panel.text}</p>
                                                        <p className="text-gray-500 text-xs italic">
                                                            提示词: {panel.imagePrompt.substring(0, 100)}...
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {editingPanels && (
                                    <button
                                        onClick={() => setEditingPanels(false)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded transition-colors mt-4"
                                    >
                                        保存所有分镜
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleSave}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>确认并保存</span>
                            </button>
                            <button
                                onClick={handleRegenerate}
                                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                重新生成
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddStory;
