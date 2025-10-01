import React from 'react';
import type { View } from '../types';

interface BottomNavProps {
  activeView: View;
  setView: (view: View) => void;
}

const HexButton: React.FC<{
  label: string;
  icon: React.ReactElement;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const activeColor = 'text-cyan-300';
  const inactiveColor = 'text-gray-500';
  
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center w-24 h-24 transition-all duration-300 group ${isActive ? '' : 'hover:text-cyan-300'}`}
      aria-label={label}
    >
      <svg
        className="absolute w-full h-full transition-all duration-300"
        viewBox="0 0 100 100"
      >
        <path
          d="M50 2.5 L95.5 26.25 V73.75 L50 97.5 L4.5 73.75 V26.25 Z"
          className={`fill-current transition-all duration-300 ${isActive ? 'text-cyan-500/20' : 'text-gray-800/20 group-hover:text-cyan-500/10'}`}
          stroke={isActive ? 'var(--primary-glow)' : 'var(--border-color)'}
          strokeWidth="2"
        />
        {isActive && (
           <path
            d="M50 2.5 L95.5 26.25 V73.75 L50 97.5 L4.5 73.75 V26.25 Z"
            fill="none"
            stroke="var(--primary-glow)"
            strokeWidth="3"
            style={{ filter: `drop-shadow(0 0 5px var(--primary-glow))` }}
          />
        )}
      </svg>
      <div className={`relative z-10 flex flex-col items-center transition-colors duration-300 ${isActive ? activeColor : inactiveColor}`}>
        {/* FIX: Removed React.cloneElement to fix type error. The required class is now part of the icon definition. */}
        {icon}
        <span className="text-xs font-bold tracking-wider">{label}</span>
      </div>
    </button>
  );
};


const BottomNav: React.FC<BottomNavProps> = ({ activeView, setView }) => {
  const EditIcon = (
    // FIX: Added 'mb-1' class to match styling from removed React.cloneElement.
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
  );

  const VideoIcon = (
     // FIX: Added 'mb-1' class to match styling from removed React.cloneElement.
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-24 bg-black/30 backdrop-blur-sm border-t border-cyan-500/30 flex justify-center">
      <div className="flex justify-center items-center space-x-8">
        <HexButton
          label="Edit Image"
          icon={EditIcon}
          isActive={activeView === 'editor'}
          onClick={() => setView('editor')}
        />
        <HexButton
          label="Create Video"
          icon={VideoIcon}
          isActive={activeView === 'video'}
          onClick={() => setView('video')}
        />
      </div>
    </nav>
  );
};

export default BottomNav;
