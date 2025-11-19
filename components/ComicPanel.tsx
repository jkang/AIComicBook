
import React, { useState } from 'react';
import { ComicPanelData } from '../types';
import { generateComicPanelImage } from '../services/geminiService';

interface ComicPanelProps {
  panel: ComicPanelData;
  panelNumber: number;
  imageUrl?: string;
  onSaveImage: (id: number, url: string) => void;
}

const ComicPanel: React.FC<ComicPanelProps> = ({ panel, panelNumber, imageUrl, onSaveImage }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      // Use the pre-defined, optimized English prompt
      const base64Image = await generateComicPanelImage(panel.imagePrompt);
      setGeneratedPreview(base64Image);
    } catch (err) {
      setError("Failed to generate image. Please try again.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
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

  const activeImage = generatedPreview || imageUrl;

  return (
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
      <div className="bg-gray-900 border-t border-gray-700 p-2 flex justify-between items-center gap-2">
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
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {activeImage ? 'Regenerate' : 'Generate Art'}
          </button>
        )}
      </div>

      {/* Text Content */}
      <div className="p-4 flex-grow bg-gray-800">
        <p className="text-gray-300 leading-relaxed text-sm md:text-base">
          {panel.text}
        </p>
      </div>
    </div>
  );
};

export default ComicPanel;
