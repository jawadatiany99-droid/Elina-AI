
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { generateVideo } from '../services/geminiService';
import Spinner from '../components/Spinner';

const FileUploadIcon = () => (
    <svg className="w-12 h-12 mx-auto text-gray-500 group-hover:text-purple-400 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const promptSuggestions = [
  {
    category: 'Style',
    suggestions: ['Cinematic', '8-bit pixel art', 'Claymation', 'Stop-motion', 'Hyperrealistic', 'Time-lapse', 'Surreal', 'Dreamlike', 'Vintage film'],
  },
  {
    category: 'Action',
    suggestions: ['Exploding', 'Floating', 'Melting', 'Growing', 'Shrinking', 'Morphing', 'Dancing', 'Racing', 'Soaring through clouds'],
  },
  {
    category: 'Camera Angle',
    suggestions: ['Drone shot', 'Close-up shot', 'Wide angle', 'First-person view', 'Dutch angle', 'Panning shot', 'Zooming in slowly'],
  },
  {
      category: 'Setting/Mood',
      suggestions: ['In a neon-lit cyberpunk city', 'On a tranquil alien planet', 'In a post-apocalyptic wasteland', 'During a golden hour sunset', 'Under a starry night sky', 'Mystical and ethereal']
  }
];


const VideoGenerator: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isHighQuality, setIsHighQuality] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(5);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResultUrl(null);
      setError(null);
    }
  };
  
  const handleProgress = useCallback((message: string) => {
    setLoadingMessage(message);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!file || !prompt.trim()) {
      setError("Please upload an image and enter a prompt.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResultUrl(null);
    setLoadingMessage('Preparing your request...');
    
    let finalPrompt = `A ${duration}-second video of ${prompt}`;
    if (isHighQuality) {
        finalPrompt += ". Make it highly detailed, cinematic, and photorealistic.";
    }

    try {
        const url = await generateVideo(file, finalPrompt, handleProgress);
        setResultUrl(url);
    } catch (e: any) {
        console.error(e);
        setError(e.message || "An unexpected error occurred during video generation.");
    } finally {
        setIsLoading(false);
    }
  }, [file, prompt, handleProgress, duration, isHighQuality]);
  
  const handlePromptSuggestionClick = (suggestion: string) => {
    setPrompt(prev => {
        if (!prev.trim()) return suggestion;
        if (prev.endsWith(' ') || prev.endsWith(',')) return `${prev}${suggestion}`;
        return `${prev}, ${suggestion}`;
    });
  };

  useEffect(() => {
    if (resultUrl && videoRef.current) {
      videoRef.current.load();
    }
  }, [resultUrl]);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg futuristic-panel">
        <h2 className="text-lg font-semibold text-purple-300 mb-3 tracking-wider">1. UPLOAD BASE IMAGE</h2>
        <label htmlFor="file-upload-video" className="relative block w-full p-6 border-2 border-purple-500/50 border-dashed rounded-lg text-center cursor-pointer hover:border-purple-400 hover:bg-purple-500/5 transition-colors group">
          <FileUploadIcon />
          <span className="mt-2 block text-sm font-semibold text-gray-300">
            {file ? file.name : "Drag & Drop or Click to Upload"}
          </span>
          <span className="block text-xs text-gray-500">SINGLE IMAGE ONLY</span>
          <input id="file-upload-video" name="file-upload-video" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
        </label>
        {file && (
          <div className="mt-4 fade-in">
            <img src={URL.createObjectURL(file)} alt="preview" className="max-w-full mx-auto h-48 object-contain rounded-md"/>
          </div>
        )}
      </div>

      <div className="p-4 rounded-lg futuristic-panel">
        <h2 className="text-lg font-semibold text-purple-300 mb-2 tracking-wider">2. DESCRIBE ANIMATION</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'the car starts driving through a neon-lit street at night'"
          className="w-full h-24 p-3 rounded-md focus:outline-none futuristic-textarea"
          style={{'--primary-glow': 'var(--secondary-glow)', '--border-color': 'rgba(208, 0, 255, 0.3)'} as React.CSSProperties}
        />
      </div>

      <div className="p-4 rounded-lg futuristic-panel">
        <h2 className="text-lg font-semibold text-purple-300 mb-3 tracking-wider">3. GENERATION SETTINGS</h2>
        <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-md bg-black/20 border border-purple-500/30">
                <div className="flex flex-col">
                    <span className="font-semibold text-purple-300">High Quality Model</span>
                    <span className="text-xs text-gray-400">Cinematic, detailed, photorealistic.</span>
                </div>
                <label htmlFor="quality-toggle-video" className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isHighQuality} onChange={() => setIsHighQuality(!isHighQuality)} id="quality-toggle-video" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
            </div>
            <div className="p-3 rounded-md bg-black/20 border border-purple-500/30">
                 <label htmlFor="duration-slider" className="flex justify-between items-center font-semibold text-purple-300 mb-2">
                    <span>Video Duration</span>
                    <span className="text-sm font-mono bg-purple-900/50 text-purple-200 px-2 py-0.5 rounded">{duration}s</span>
                 </label>
                 <input
                    id="duration-slider"
                    type="range"
                    min="2"
                    max="15"
                    step="1"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
            </div>
        </div>
      </div>
      
      <div className="p-4 rounded-lg futuristic-panel">
        <h2 className="text-lg font-semibold text-purple-300 mb-3 tracking-wider">4. ENHANCE PROMPT (OPTIONAL)</h2>
        <div className="space-y-3">
          {promptSuggestions.map((category) => (
            <div key={category.category}>
              <h3 className="text-sm font-semibold text-purple-200 mb-2">{category.category}</h3>
              <div className="flex flex-wrap gap-2">
                {category.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handlePromptSuggestionClick(suggestion)}
                    className="px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 border bg-black/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading || !file || !prompt.trim()}
        className="w-full py-3 px-4 rounded-md futuristic-button futuristic-button-secondary"
      >
        {isLoading ? 'Generating Video...' : 'Create Video'}
      </button>

      {error && <div className="p-3 bg-red-900/50 text-red-200 border border-red-500/50 rounded-lg fade-in futuristic-panel">{error}</div>}

      {isLoading && <Spinner message={loadingMessage} />}
      
      {resultUrl && (
        <div className="space-y-4 fade-in">
          <h2 className="text-xl font-bold text-center text-purple-300 tracking-widest">VIDEO READY</h2>
          <div className="rounded-lg p-3 shadow-md futuristic-panel">
            <video ref={videoRef} controls autoPlay loop muted className="w-full rounded-md">
              <source src={resultUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="mt-4">
              <a
                href={resultUrl}
                download={`elina-ai-video-${Date.now()}.mp4`}
                className="w-full sm:w-auto inline-block text-center py-2 px-4 rounded-md futuristic-button futuristic-button-secondary text-sm"
              >
                Download Video
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;
