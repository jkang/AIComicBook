import { Story } from '../types';

export const exportStoryAsHTML = (story: Story, images: Record<number, string>): void => {
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${story.title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #e5e5e5;
      padding: 20px;
      min-height: 100vh;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    header {
      text-align: center;
      padding: 40px 20px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      margin-bottom: 40px;
      backdrop-filter: blur(10px);
    }
    
    h1 {
      font-size: 2.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 10px;
    }
    
    .meta {
      color: #999;
      font-size: 0.9rem;
    }
    
    .characters {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 40px;
    }
    
    .characters h2 {
      color: #667eea;
      margin-bottom: 15px;
      font-size: 1.3rem;
    }
    
    .character-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .character-tag {
      background: rgba(102, 126, 234, 0.2);
      border: 1px solid rgba(102, 126, 234, 0.3);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.9rem;
      color: #a5b4fc;
    }
    
    .panels {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 30px;
      margin-bottom: 40px;
    }
    
    .panel {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .panel:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
    
    .panel-number {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-center;
      font-weight: bold;
      font-size: 1.1rem;
      z-index: 10;
      backdrop-filter: blur(5px);
    }
    
    .panel-image {
      position: relative;
      width: 100%;
      aspect-ratio: 4/3;
      background: #2a2a3e;
    }
    
    .panel-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .panel-text {
      padding: 20px;
      line-height: 1.6;
      font-size: 0.95rem;
      color: #d1d5db;
    }
    
    footer {
      text-align: center;
      padding: 30px;
      color: #666;
      font-size: 0.85rem;
    }
    
    @media (max-width: 768px) {
      .panels {
        grid-template-columns: 1fr;
      }
      
      h1 {
        font-size: 2rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${story.title}</h1>
      <div class="meta">
        Created: ${new Date(story.createdAt).toLocaleDateString('zh-CN')}
        | Panels: ${story.panels.length}
      </div>
    </header>
    
    ${story.characters.length > 0 ? `
    <div class="characters">
      <h2>主要角色</h2>
      <div class="character-list">
        ${story.characters.map(char => `<div class="character-tag">${char}</div>`).join('')}
      </div>
    </div>
    ` : ''}
    
    <div class="panels">
      ${story.panels.map((panel, index) => `
        <div class="panel">
          <div class="panel-image">
            <div class="panel-number">${index + 1}</div>
            ${images[panel.id] ? `<img src="${images[panel.id]}" alt="Panel ${index + 1}" />` : ''}
          </div>
          <div class="panel-text">${panel.text}</div>
        </div>
      `).join('')}
    </div>
    
    <footer>
      <p>Generated with AI Comic Book Creator</p>
      <p>${new Date().toLocaleDateString('zh-CN')}</p>
    </footer>
  </div>
</body>
</html>`;

    // Create and download the file
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${story.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
