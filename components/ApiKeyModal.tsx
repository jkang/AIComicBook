import React, { useState, useEffect } from 'react';
import { saveApiKey, getApiKey, validateApiKey, removeApiKey } from '../services/apiKeyService';
import { Key, X, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existingKey = getApiKey();
      if (existingKey) {
        setApiKey(existingKey);
      }
      setError(null);
    }
  }, [isOpen]);

  const handleSave = () => {
    setError(null);
    
    // 验证 API key
    const validation = validateApiKey(apiKey);
    if (!validation.valid) {
      setError(validation.error || 'API key 无效');
      return;
    }

    setIsSaving(true);
    try {
      saveApiKey(apiKey);
      setTimeout(() => {
        setIsSaving(false);
        onSave();
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err.message || '保存失败');
      setIsSaving(false);
    }
  };

  const handleRemove = () => {
    if (window.confirm('确定要删除已保存的 API key 吗？')) {
      removeApiKey();
      setApiKey('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 rounded-lg">
              <Key className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-100">设置 API Key</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors p-1 hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Info Box */}
          <div className="bg-indigo-900/30 border border-indigo-700/50 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-300 space-y-2">
                <p>需要 Google Gemini API key 才能生成漫画图片和故事。</p>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  获取免费 API key
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError(null);
                }}
                placeholder="AIza..."
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all pr-20"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-xs transition-colors"
              >
                {showKey ? '隐藏' : '显示'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Success Indicator */}
          {isSaving && (
            <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-sm text-green-300">保存成功！</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-700">
          {getApiKey() && (
            <button
              onClick={handleRemove}
              className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 border border-red-900 hover:bg-red-900/30 rounded-lg transition-colors"
            >
              删除
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 hover:text-gray-100 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !apiKey.trim()}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;

