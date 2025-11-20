import React, { useState } from 'react';
import { generateStoryPanels } from '../services/geminiService';
import { Story, ComicPanelData } from '../types';
import { hasApiKey } from '../services/apiKeyService';
import ApiKeyModal from './ApiKeyModal';
import ErrorModal, { ErrorType } from './ErrorModal';
import { BookOpen, Sparkles, Globe, Tag, X, Loader2, Zap } from 'lucide-react';

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

    // API Key Modal State
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);

    // Error Modal State
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorType, setErrorType] = useState<ErrorType>('general');
    const [errorMessage, setErrorMessage] = useState<string>('');

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

        // 生成分镜不需要检查 API key，使用环境变量的 key
        // 只有生成图片时才需要用户提供自己的 key

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
            console.error('Error generating story:', err);

            // 解析错误响应
            let type: ErrorType = 'general';
            let message = err.message || '生成失败，请稍后重试。';

            // 如果是 fetch 错误，尝试解析响应
            if (err.message && err.message.includes('Failed to generate story')) {
                // 从错误消息中提取错误类型
                if (err.message.includes('quota') || err.message.includes('rate limit')) {
                    type = 'quota';
                } else if (err.message.includes('API key') || err.message.includes('Invalid')) {
                    type = 'auth';
                } else if (err.message.includes('network') || err.message.includes('Network')) {
                    type = 'network';
                }
            }

            setErrorType(type);
            setErrorMessage(message);
            setShowErrorModal(true);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApiKeySaved = () => {
        // API key 保存后，关闭弹框
        setShowApiKeyModal(false);
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
        <>
            {/* API Key Modal */}
            <ApiKeyModal
                isOpen={showApiKeyModal}
                onClose={() => setShowApiKeyModal(false)}
                onSave={handleApiKeySaved}
            />

            {/* Error Modal */}
            <ErrorModal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                errorType={errorType}
                errorMessage={errorMessage}
            />

            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950 text-gray-200 p-4 md:p-8">
                <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                创建新故事
                            </h1>
                            <p className="text-sm text-gray-400 mt-1">让 AI 将你的想法变成精彩的漫画故事</p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-white transition-all hover:rotate-90 duration-300 p-2 hover:bg-gray-800 rounded-lg"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {!generatedResult ? (
                    /* Input Form */
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-6 md:p-8 space-y-8">
                        {/* Title Input */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-200">
                                <Sparkles className="w-4 h-4 text-indigo-400" />
                                故事标题 *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="给你的故事起个名字..."
                                className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                maxLength={100}
                            />
                        </div>

                        {/* Story Text Input */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-200">
                                    <BookOpen className="w-4 h-4 text-indigo-400" />
                                    故事内容 *
                                </label>
                                <span className={`text-sm font-medium ${charCount > maxChars ? 'text-red-400' : 'text-gray-400'}`}>
                                    {charCount} / {maxChars}
                                </span>
                            </div>
                            <div className="relative">
                                <textarea
                                    value={storyText}
                                    onChange={(e) => setStoryText(e.target.value)}
                                    placeholder="输入你的故事创意..."
                                    className="w-full h-64 bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                                    maxLength={maxChars}
                                />
                            </div>
                            {/* Tips */}
                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Zap className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                                    <div className="space-y-2 text-sm text-gray-300">
                                        <p className="font-medium text-indigo-300">💡 创作提示：</p>
                                        <ul className="space-y-1 text-gray-400">
                                            <li>• 1500字以内：生成 8-10 个分镜</li>
                                            <li>• 1500字以上：生成 15-20 个分镜</li>
                                            <li>• 最多支持 10000 字</li>
                                            <li>• AI 会自动优化故事，添加视觉细节</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Keywords Input */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-200">
                                <Tag className="w-4 h-4 text-indigo-400" />
                                关键词 <span className="text-gray-500 font-normal">(可选)</span>
                            </label>
                            <input
                                type="text"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                placeholder="例如：温馨, 童趣, 冒险..."
                                className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                            <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
                                用逗号分隔，帮助 AI 更好地理解故事风格
                            </p>
                        </div>

                        {/* Language Selector */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-200">
                                <Globe className="w-4 h-4 text-indigo-400" />
                                输出语言
                            </label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedLanguage('auto')}
                                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${selectedLanguage === 'auto'
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                            : 'bg-gray-900/50 text-gray-400 hover:bg-gray-800 border border-gray-600 hover:border-gray-500'
                                        }`}
                                >
                                    🤖 自动检测
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedLanguage('zh')}
                                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${selectedLanguage === 'zh'
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                            : 'bg-gray-900/50 text-gray-400 hover:bg-gray-800 border border-gray-600 hover:border-gray-500'
                                        }`}
                                >
                                    🇨🇳 中文
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedLanguage('en')}
                                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${selectedLanguage === 'en'
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                            : 'bg-gray-900/50 text-gray-400 hover:bg-gray-800 border border-gray-600 hover:border-gray-500'
                                        }`}
                                >
                                    🇺🇸 English
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
                                图片提示词始终为英文以获得最佳效果
                            </p>
                        </div>

                        {/* Generate Button */}
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !storyText.trim() || !title.trim() || charCount > maxChars}
                                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/50 disabled:shadow-none flex items-center justify-center gap-2.5 group"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>AI 正在创作中...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        <span>生成分镜</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={onCancel}
                                className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-semibold py-4 px-8 rounded-xl transition-all border border-gray-600 hover:border-gray-500"
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
        </>
    );
};

export default AddStory;
