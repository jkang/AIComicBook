
import React from 'react';
import { COMIC_PANELS } from './constants';
import { panelImages } from './assets/images';
import ComicPanel from './components/ComicPanel';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <header className="bg-gray-800/80 backdrop-blur-sm sticky top-0 z-20 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-indigo-400 text-center tracking-wider">
            AI 宕掉的 72 小时
          </h1>
          <p className="text-center text-gray-400 mt-1">A Web Comic</p>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {COMIC_PANELS.map((panel, index) => (
            <ComicPanel
              key={panel.id}
              panel={panel}
              panelNumber={index + 1}
              imageUrl={panelImages[panel.id]}
            />
          ))}
        </div>
      </main>

      <footer className="text-center p-4 mt-8 text-gray-500 text-sm">
        <p>Story based on "72 Hours of AI Downtime".</p>
      </footer>
    </div>
  );
};

export default App;
