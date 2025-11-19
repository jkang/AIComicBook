
import React, { useState, useEffect } from 'react';
import { COMIC_PANELS } from './constants';
import ComicPanel from './components/ComicPanel';
import { getAllImagesFromDB, saveImageToDB, clearAllImagesFromDB } from './services/storageService';

const App: React.FC = () => {
  // State to manage images. 
  // initialized as empty, will hydrate from IndexedDB
  const [images, setImages] = useState<Record<number, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load images from IndexedDB on mount
  useEffect(() => {
    const loadImages = async () => {
      try {
        const storedImages = await getAllImagesFromDB();
        setImages(storedImages);
      } catch (error) {
        console.error("Failed to load images from DB", error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadImages();
  }, []);

  const handleSaveImage = async (panelId: number, imageUrl: string) => {
    // Update state immediately for UI feedback
    setImages((prev) => ({
      ...prev,
      [panelId]: imageUrl,
    }));
    
    // Persist to IndexedDB
    try {
      await saveImageToDB(panelId, imageUrl);
    } catch (error) {
      console.error("Failed to save image to DB", error);
      alert("Failed to save image locally. It will be lost on refresh.");
    }
  };

  const handleClearStorage = async () => {
      if(window.confirm("Are you sure you want to delete all generated images?")) {
          await clearAllImagesFromDB();
          setImages({});
      }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <header className="bg-gray-800/80 backdrop-blur-sm sticky top-0 z-20 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-indigo-400 tracking-wider">
                AI 宕掉的 72 小时
            </h1>
            <p className="text-gray-400 mt-1 text-sm">A Web Comic Generator</p>
          </div>
          <button 
            onClick={handleClearStorage}
            className="text-xs text-red-400 hover:text-red-300 border border-red-900 hover:bg-red-900/30 px-3 py-1 rounded transition-colors"
          >
            Reset Images
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        {!isLoaded ? (
            <div className="text-center py-20">Loading comic data...</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {COMIC_PANELS.map((panel, index) => (
                <ComicPanel
                key={panel.id}
                panel={panel}
                panelNumber={index + 1}
                imageUrl={images[panel.id]}
                onSaveImage={handleSaveImage}
                />
            ))}
            </div>
        )}
      </main>

      <footer className="text-center p-8 mt-8 text-gray-500 text-sm border-t border-gray-800">
        <p>Story based on "72 Hours of AI Downtime". Images generated via Google Imagen.</p>
      </footer>
    </div>
  );
};

export default App;
