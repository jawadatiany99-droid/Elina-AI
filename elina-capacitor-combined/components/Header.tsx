import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-black/30 backdrop-blur-sm border-b border-cyan-500/30 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-cyan-300 glitch">
          ELINA AI
        </h1>
      </div>
    </header>
  );
};

export default Header;