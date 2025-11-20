
import React, { useState, useEffect } from 'react';
import { COMIC_PANELS } from './constants';
import ComicPanel from './components/ComicPanel';
import AddStory from './components/AddStory';
import { getAllImagesFromDB, saveImageToDB, clearAllImagesFromDB, getAllTextsFromDB, saveTextToDB, clearAllTextsFromDB, getAllStoriesFromDB, saveStoryToDB, deleteStoryFromDB } from './services/storageService';
import { panelImages } from './assets/images';
import { Story } from './types';
import { exportStoryAsHTML } from './services/exportService';

type ViewMode = 'default' | 'add-story' | 'custom-story';

const DEFAULT_STORY_ID = 'default';

const App: React.FC = () => {
  // State to manage images and texts
  // Key format: {storyId}_{panelId}
  const [images, setImages] = useState<Record<string, string>>({});
  const [panelTexts, setPanelTexts] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // View and story management
  const [viewMode, setViewMode] = useState<ViewMode>('default');
  const [customStories, setCustomStories] = useState<Story[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

  // Load data from IndexedDB on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedImages = await getAllImagesFromDB();
        // Only merge with default images for default story view
        // Custom stories should start with empty images
        setImages(storedImages);

        const storedTexts = await getAllTextsFromDB();
        setPanelTexts(storedTexts);

        const stories = await getAllStoriesFromDB();
        setCustomStories(stories);
      } catch (error) {
        console.error("Failed to load data from DB", error);
        setImages({});
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  const handleSaveImage = async (panelId: number, imageUrl: string) => {
    const currentStoryId = selectedStoryId || DEFAULT_STORY_ID;
    const key = `${currentStoryId}_${panelId}`;

    setImages((prev) => ({
      ...prev,
      [key]: imageUrl,
    }));

    try {
      await saveImageToDB(currentStoryId, panelId, imageUrl);
    } catch (error) {
      console.error("Failed to save image to DB", error);
      alert("Failed to save image locally. It will be lost on refresh.");
    }
  };

  const handleSaveText = async (panelId: number, newText: string) => {
    const currentStoryId = selectedStoryId || DEFAULT_STORY_ID;
    const key = `${currentStoryId}_${panelId}`;

    setPanelTexts((prev) => ({
      ...prev,
      [key]: newText,
    }));

    try {
      await saveTextToDB(currentStoryId, panelId, newText);
    } catch (error) {
      console.error("Failed to save text to DB", error);
    }
  };

  const handleClearStorage = async () => {
    if (window.confirm("确定要删除所有生成的图片和编辑吗？")) {
      await clearAllImagesFromDB();
      await clearAllTextsFromDB();
      setImages({});
      setPanelTexts({});
    }
  };

  const handleSaveStory = async (story: Story) => {
    try {
      await saveStoryToDB(story);
      setCustomStories((prev) => [story, ...prev]);
      setSelectedStoryId(story.id);
      setViewMode('custom-story');
    } catch (error) {
      console.error("Failed to save story", error);
      alert("保存故事失败");
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (window.confirm("确定要删除这个故事吗？")) {
      try {
        await deleteStoryFromDB(storyId);
        setCustomStories((prev) => prev.filter(s => s.id !== storyId));
        if (selectedStoryId === storyId) {
          setSelectedStoryId(null);
          setViewMode('default');
        }
      } catch (error) {
        console.error("Failed to delete story", error);
      }
    }
  };

  const handleExportStory = () => {
    const story = customStories.find(s => s.id === selectedStoryId);
    if (story && selectedStoryId) {
      // Filter images for this story and convert keys back to numbers
      const storyImages: Record<number, string> = {};
      Object.entries(images).forEach(([key, url]) => {
        if (key.startsWith(`${selectedStoryId}_`)) {
          const panelId = parseInt(key.split('_')[1], 10);
          if (!isNaN(panelId)) {
            storyImages[panelId] = url;
          }
        }
      });
      exportStoryAsHTML(story, storyImages);
    }
  };

  // Get current panels based on view mode
  const getCurrentPanels = () => {
    if (viewMode === 'custom-story' && selectedStoryId) {
      const story = customStories.find(s => s.id === selectedStoryId);
      return story ? story.panels : [];
    }
    return COMIC_PANELS;
  };

  const getCurrentImage = (panelId: number): string | undefined => {
    const currentStoryId = selectedStoryId || DEFAULT_STORY_ID;
    const key = `${currentStoryId}_${panelId}`;

    if (viewMode === 'default') {
      // For default story, use panelImages as fallback
      return images[key] || panelImages[panelId];
    }
    // For custom stories, only use stored images (no fallback to default)
    return images[key];
  };

  const getCurrentText = (panelId: number, defaultText: string): string => {
    const currentStoryId = selectedStoryId || DEFAULT_STORY_ID;
    const key = `${currentStoryId}_${panelId}`;
    return panelTexts[key] || defaultText;
  };

  const getCurrentTitle = () => {
    if (viewMode === 'custom-story' && selectedStoryId) {
      const story = customStories.find(s => s.id === selectedStoryId);
      return story ? story.title : 'AI 宕掉的 72 小时';
    }
    return 'AI 宕掉的 72 小时';
  };

  if (viewMode === 'add-story') {
    return (
      <AddStory
        onSave={handleSaveStory}
        onCancel={() => setViewMode('default')}
      />
    );
  }

  const currentPanels = getCurrentPanels();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <header className="bg-gray-800/80 backdrop-blur-sm sticky top-0 z-20 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-indigo-400 tracking-wider">
                {getCurrentTitle()}
              </h1>
              <p className="text-gray-400 mt-1 text-sm">AI Comic Book Generator</p>
            </div>
            <div className="flex gap-2">
              {viewMode === 'custom-story' && (
                <>
                  <button
                    onClick={handleExportStory}
                    className="text-xs text-indigo-400 hover:text-green-400 border border-indigo-900 hover:border-green-900 hover:bg-green-900/30 px-3 py-1 rounded transition-colors"
                  >
                    导出 HTML
                  </button>
                  <button
                    onClick={() => selectedStoryId && handleDeleteStory(selectedStoryId)}
                    className="text-xs text-indigo-400 hover:text-red-400 border border-indigo-900 hover:border-red-900 hover:bg-red-900/30 px-3 py-1 rounded transition-colors"
                  >
                    删除故事
                  </button>
                </>
              )}
              <button
                onClick={() => setViewMode('add-story')}
                className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-900 hover:bg-indigo-900/30 px-3 py-1 rounded transition-colors"
              >
                + 添加故事
              </button>
            </div>
          </div>

          {/* Story Selector */}
          {customStories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => {
                  setViewMode('default');
                  setSelectedStoryId(null);
                }}
                className={`px-3 py-1 rounded text-xs whitespace-nowrap transition-colors ${viewMode === 'default'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
              >
                默认故事
              </button>
              {customStories.map((story) => (
                <button
                  key={story.id}
                  onClick={() => {
                    setSelectedStoryId(story.id);
                    setViewMode('custom-story');
                  }}
                  className={`px-3 py-1 rounded text-xs whitespace-nowrap transition-colors ${selectedStoryId === story.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                  {story.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        {!isLoaded ? (
          <div className="text-center py-20">Loading comic data...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentPanels.map((panel, index) => (
              <ComicPanel
                key={panel.id}
                panel={{
                  ...panel,
                  text: getCurrentText(panel.id, panel.text)
                }}
                panelNumber={index + 1}
                imageUrl={getCurrentImage(panel.id)}
                onSaveImage={handleSaveImage}
                onSaveText={handleSaveText}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="text-center p-8 mt-8 text-gray-500 text-sm border-t border-gray-800">
        <p>AI Comic Book Generator. Images generated via Google Imagen.</p>
      </footer>
    </div>
  );
};

export default App;
