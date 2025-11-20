
import React, { useState } from 'react';
import { ComicPanelData } from '../types';
import { generateComicPanelImage } from '../services/geminiService';
import { hasApiKey } from '../services/apiKeyService';
import ApiKeyModal from './ApiKeyModal';
import ErrorModal, { ErrorType } from './ErrorModal';

interface ComicPanelProps {
  panel: ComicPanelData;
  panelNumber: number;
  imageUrl?: string;
  onSaveImage: (id: number, url: string) => void;
  onSaveText: (id: number, text: string) => void;
}

const ComicPanel: React.FC<ComicPanelProps> = ({ panel, panelNumber, imageUrl, onSaveImage, onSaveText }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Text Editing State
  const [isEditingText, setIsEditingText] = useState(false);
  const [textInput, setTextInput] = useState(panel.text);

  // Custom Regeneration State
  const [showRegenInput, setShowRegenInput] = useState(false);
  const [regenPrompt, setRegenPrompt] = useState('');

  // API Key Modal State
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // Error Modal State
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorType, setErrorType] = useState<ErrorType>('general');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleGenerate = async (customPrompt?: string) => {
    // 检查是否有 API key
    if (!hasApiKey()) {
      setShowApiKeyModal(true);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setShowRegenInput(false); // Close input if open

    try {
      // Use the pre-defined, optimized English prompt
      let finalPrompt = panel.imagePrompt;
      if (customPrompt) {
        finalPrompt += ` Modification request: ${customPrompt}`;
      }

      const base64Image = await generateComicPanelImage(finalPrompt);
      setGeneratedPreview(base64Image);
    } catch (err: any) {
      console.error('Error generating image:', err);

      // 解析错误响应
      let type: ErrorType = 'general';
      let message = err.message || '生成失败，请稍后重试。';

      // 如果是 fetch 错误，尝试解析响应
      if (err.message && err.message.includes('Failed to generate image')) {
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
    if (generatedPreview) {
      onSaveImage(panel.id, generatedPreview);
      setGeneratedPreview(null);
    }
  };

  const handleCancel = () => {
    setGeneratedPreview(null);
    setError(null);
  };

  const handleTextSave = () => {
    if (textInput.trim() !== panel.text) {
      onSaveText(panel.id, textInput.trim());
    }
    setIsEditingText(false);
  };

  const handleTextCancel = () => {
    setTextInput(panel.text);
    setIsEditingText(false);
  };

  const activeImage = generatedPreview || imageUrl;

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

      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden flex flex-col h-full transform transition-transform hover:shadow-indigo-500/20 relative group">

      {/* Image Area */}
      <div className="relative w-full aspect-[4/3] bg-gray-700 group-hover:bg-gray-600 transition-colors">
        {activeImage ? (
          <img
            src={activeImage}
            alt={`Comic panel ${panelNumber}`}
            className={`w-full h-full object-cover ${isGenerating ? 'opacity-50 blur-sm' : ''}`}
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gray-700/50 ${isGenerating ? 'opacity-50' : ''}`}>
            <svg width="60%" height="60%" viewBox="0 0 100 75" className="text-gray-600">
              <rect x="2" y="2" width="96" height="71" fill="none" stroke="currentColor" strokeWidth="1" rx="2" style={{ vectorEffect: 'non-scaling-stroke' }} />
              <path d="M 20,55 Q 40,35 50,55 T 80,55" stroke="currentColor" strokeWidth="1" fill="none" style={{ vectorEffect: 'non-scaling-stroke' }} />
              <circle cx="75" cy="25" r="8" stroke="currentColor" strokeWidth="1" fill="none" style={{ vectorEffect: 'non-scaling-stroke' }} />
            </svg>
            <p className="text-gray-500 text-sm mt-2 italic">No image yet</p>
          </div>
        )}

        {/* Loading Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-2"></div>
            <span className="text-indigo-400 font-semibold text-sm shadow-black drop-shadow-md">Creating Art...</span>
          </div>
        )}

        {/* Panel Number */}
        <div className="absolute top-2 left-2 bg-black/60 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-sm backdrop-blur-sm z-10">
          {panelNumber}
        </div>

        {/* Error Message */}
        {error && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-500/90 text-white text-xs p-2 text-center">
            {error}
          </div>
        )}
      </div>

      {/* Controls Area */}
      <div className="bg-gray-900 border-t border-gray-700 p-2 flex flex-col gap-2">
        {showRegenInput && !generatedPreview && (
          <div className="flex flex-col gap-2 mb-1 animate-fadeIn">
            <input
              type="text"
              value={regenPrompt}
              onChange={(e) => setRegenPrompt(e.target.value)}
              placeholder="Enter modification suggestions..."
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate(regenPrompt)}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleGenerate(regenPrompt)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1 rounded"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowRegenInput(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white text-xs py-1 px-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center gap-2">
          {generatedPreview ? (
            <>
              <button
                onClick={handleSave}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-3 rounded transition-colors"
              >
                Save & Keep
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-600 hover:bg-gray-500 text-white text-xs font-bold py-2 px-3 rounded transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => activeImage ? setShowRegenInput(!showRegenInput) : handleGenerate()}
              disabled={isGenerating}
              className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {activeImage ? (showRegenInput ? 'Close Options' : 'Regenerate') : 'Generate Art'}
            </button>
          )}
        </div>
      </div>

      {/* Text Content */}
      <div className="p-4 flex-grow bg-gray-800 relative group/text">
        {isEditingText ? (
          <div className="flex flex-col gap-2 h-full">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full h-full min-h-[100px] bg-gray-700 text-gray-200 p-2 rounded border border-indigo-500 focus:outline-none text-sm resize-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleTextSave}
                className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
              >
                Save
              </button>
              <button
                onClick={handleTextCancel}
                className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={() => {
                setIsEditingText(true);
                setTextInput(panel.text);
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-indigo-400 opacity-0 group-hover/text:opacity-100 transition-opacity p-1"
              title="Edit text"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <p className="text-gray-300 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
              {panel.text}
            </p>
          </>
        )}
      </div>
    </div>
    </>
  );
};

export default ComicPanel;
