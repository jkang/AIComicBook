
import React from 'react';
import { ComicPanelData } from '../types';

interface ComicPanelProps {
  panel: ComicPanelData;
  panelNumber: number;
  imageUrl?: string;
}

const ComicPanel: React.FC<ComicPanelProps> = ({ panel, panelNumber, imageUrl }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden flex flex-col h-full transform transition-transform hover:-translate-y-1 hover:shadow-indigo-500/20">
      <div className="relative w-full aspect-[4/3] bg-gray-700">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Comic panel for: ${panel.text.substring(0, 30)}...`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gray-700/50">
            <svg width="80%" height="80%" viewBox="0 0 100 75" className="text-gray-600">
              <rect x="2" y="2" width="96" height="71" fill="none" stroke="currentColor" strokeWidth="1" rx="2" style={{ vectorEffect: 'non-scaling-stroke' }} />
              <path d="M 20,55 Q 40,35 50,55 T 80,55" stroke="currentColor" strokeWidth="1" fill="none" style={{ vectorEffect: 'non-scaling-stroke' }} />
              <circle cx="75" cy="25" r="8" stroke="currentColor" strokeWidth="1" fill="none" style={{ vectorEffect: 'non-scaling-stroke' }} />
               <line x1="5" y1="68" x2="95" y2="68" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
               <line x1="5" y1="5" x2="95" y2="70" stroke="currentColor" strokeWidth="0.5" />
               <line x1="95" y1="5" x2="5" y2="70" stroke="currentColor" strokeWidth="0.5" />
            </svg>
            <p className="text-gray-500 text-sm mt-2 italic">Illustration coming soon...</p>
          </div>
        )}
        <div className="absolute top-2 left-2 bg-black/60 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-sm backdrop-blur-sm">
          {panelNumber}
        </div>
      </div>
      <div className="p-4 flex-grow">
        <p className="text-gray-300 leading-relaxed text-sm md:text-base">
          {panel.text}
        </p>
      </div>
    </div>
  );
};

export default ComicPanel;
