import React from 'react';
import { AlertCircle, XCircle, WifiOff, Key, CreditCard, X } from 'lucide-react';

export type ErrorType = 'quota' | 'auth' | 'network' | 'general';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorType: ErrorType;
  errorMessage?: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, errorType, errorMessage }) => {
  if (!isOpen) return null;

  const getErrorConfig = () => {
    switch (errorType) {
      case 'quota':
        return {
          icon: <CreditCard className="w-16 h-16 text-yellow-400" />,
          title: '免费额度已用完',
          message: '您的 Gemini API 免费额度已经用完了。',
          suggestions: [
            '等待配额重置（通常每天或每月重置）',
            '升级到付费计划以获得更多配额',
            '检查 Google AI Studio 中的配额使用情况',
          ],
          link: {
            text: '查看配额详情',
            url: 'https://ai.google.dev/pricing',
          },
        };
      case 'auth':
        return {
          icon: <Key className="w-16 h-16 text-red-400" />,
          title: 'API Key 无效',
          message: '您提供的 API Key 无效或已过期。',
          suggestions: [
            '检查 API Key 是否正确复制',
            '确认 API Key 未被撤销',
            '重新生成一个新的 API Key',
          ],
          link: {
            text: '获取新的 API Key',
            url: 'https://aistudio.google.com/app/apikey',
          },
        };
      case 'network':
        return {
          icon: <WifiOff className="w-16 h-16 text-orange-400" />,
          title: '网络连接失败',
          message: '无法连接到 Gemini API 服务。',
          suggestions: [
            '检查您的网络连接',
            '稍后重试',
            '确认防火墙未阻止请求',
          ],
          link: null,
        };
      default:
        return {
          icon: <XCircle className="w-16 h-16 text-red-400" />,
          title: '生成失败',
          message: errorMessage || '图片生成过程中出现了问题。',
          suggestions: [
            '请稍后重试',
            '如果问题持续，请检查 API Key 设置',
            '尝试简化提示词',
          ],
          link: null,
        };
    }
  };

  const config = getErrorConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 animate-slideUp">
        {/* Close Button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          {config.icon}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-3">
          {config.title}
        </h2>

        {/* Message */}
        <p className="text-gray-300 text-center mb-6">
          {config.message}
        </p>

        {/* Suggestions */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            建议解决方案：
          </h3>
          <ul className="space-y-2">
            {config.suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-indigo-400 mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Link */}
        {config.link && (
          <a
            href={config.link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center py-3 rounded-lg transition-colors mb-3"
          >
            {config.link.text}
          </a>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
        >
          关闭
        </button>
      </div>
    </div>
  );
};

export default ErrorModal;

