import React, { useState } from 'react';
import type { View } from './types';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ImageEditor from './views/ImageEditor';
import VideoGenerator from './views/VideoGenerator';

const App: React.FC = () => {
  const [view, setView] = useState<View>('editor');

  return (
    <div className="flex flex-col h-screen font-sans">
      <Header />
      <main className="flex-1 overflow-y-auto pb-20">
        <div key={view} className="container mx-auto px-4 py-6 max-w-2xl fade-in">
          {view === 'editor' && <ImageEditor />}
          {view === 'video' && <VideoGenerator />}
        </div>
      </main>
      <BottomNav activeView={view} setView={setView} />
    </div>
  );
};

export default App;