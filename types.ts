
export interface ComicPanelData {
  id: number;
  text: string;
  imagePrompt: string;
}

export interface Story {
  id: string;
  title: string;
  panels: ComicPanelData[];
  characters: string[];
  visualStyle: string; // Base visual style for this story
  createdAt: number;
}
