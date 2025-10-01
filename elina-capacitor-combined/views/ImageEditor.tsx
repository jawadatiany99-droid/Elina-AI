
import React, { useState, useCallback } from 'react';
import { editImage } from '../services/geminiService';
import type { ImageResult } from '../types';
import Spinner from '../components/Spinner';

const FileUploadIcon = () => (
    <svg className="w-12 h-12 mx-auto text-gray-500 group-hover:text-cyan-400 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const filters: { name: string; value: ImageResult['activeFilter'] }[] = [
    { name: 'Grayscale', value: 'grayscale' },
    { name: 'Sepia', value: 'sepia' },
    { name: 'Invert', value: 'invert' },
    { name: 'Blur', value: 'blur' },
    { name: 'Saturation', value: 'saturate' },
    { name: 'Reset', value: 'none' },
];

const getFilterStyle = (filter: ImageResult['activeFilter'], blurRadius: number, saturation: number): React.CSSProperties => {
    switch (filter) {
        case 'grayscale':
            return { filter: 'grayscale(1)' };
        case 'sepia':
            return { filter: 'sepia(1)' };
        case 'invert':
            return { filter: 'invert(1)' };
        case 'blur':
            return { filter: `blur(${blurRadius}px)` };
        case 'saturate':
            return { filter: `saturate(${saturation / 100})` };
        default:
            return { filter: 'none' };
    }
};


const ImageEditor: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [results, setResults] = useState<ImageResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isHighQuality, setIsHighQuality] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setResults([]);
      setError(null);
    }
  };
  
  const processImages = useCallback(async (basePrompt: string) => {
    if (files.length === 0) {
      setError("Please upload at least one image.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResults([]);
    
    const editPrompt = isHighQuality
      ? `${basePrompt}. Ensure the result is high-resolution, photorealistic, and highly detailed.`
      : basePrompt;

    const newResults: ImageResult[] = [];
    try {
        for(const file of files) {
            const originalSrc = URL.createObjectURL(file);
            const editedSrc = await editImage(file, editPrompt);
            newResults.push({ originalSrc, editedSrc, activeFilter: 'none', blurRadius: 8, saturation: 100 });
        }
        setResults(newResults);
    } catch (e: any) {
        console.error(e);
        setError(e.message || "An unexpected error occurred.");
    } finally {
        setIsLoading(false);
    }
  }, [files, isHighQuality]);


  const handleCustomSubmit = () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt to describe your edit.");
      return;
    }
    processImages(prompt);
  };

  const handleAnimeSubmit = () => {
    const animePrompt = "Transform this image into a high-quality, detailed anime style. Focus on creating vibrant colors, sharp lines, and expressive cel-shaded features typical of modern Japanese animation. Adapt the subjects and background to the anime aesthetic seamlessly.";
    processImages(animePrompt);
  };

  const handleFilterChange = (index: number, filter: ImageResult['activeFilter']) => {
    setResults(currentResults =>
        currentResults.map((result, i) =>
            i === index ? { ...result, activeFilter: filter } : result
        )
    );
  };

  const handleBlurChange = (index: number, radius: number) => {
    setResults(currentResults =>
      currentResults.map((result, i) =>
        i === index ? { ...result, blurRadius: radius } : result
      )
    );
  };
  
  const handleSaturationChange = (index: number, value: number) => {
    setResults(currentResults =>
      currentResults.map((result, i) =>
        i === index ? { ...result, saturation: value } : result
      )
    );
  };

  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement>, result: ImageResult) => {
    e.preventDefault();
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = result.editedSrc;
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.filter = getFilterStyle(result.activeFilter, result.blurRadius, result.saturation).filter || 'none';
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `elina-ai-edit-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
  };


  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg futuristic-panel">
        <h2 className="text-lg font-semibold text-cyan-300 mb-3 tracking-wider">1. UPLOAD IMAGES</h2>
        <label htmlFor="file-upload" className="relative block w-full p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors group border-cyan-500/50 hover:border-cyan-400 hover:bg-cyan-500/5">
          <FileUploadIcon />
          <span className="mt-2 block text-sm font-semibold text-gray-300">
            {files.length > 0 ? `${files.length} image(s) selected` : "Drag & Drop or Click to Upload"}
          </span>
          <span className="block text-xs text-gray-500">MULTIPLE FILES SUPPORTED</span>
          <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleFileChange} />
        </label>
        {files.length > 0 && (
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
            {files.map((file, index) => (
              <img key={index} src={URL.createObjectURL(file)} alt={`preview ${index}`} className="w-full h-24 object-cover rounded-md fade-in" style={{animationDelay: `${index * 100}ms`}}/>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 rounded-lg futuristic-panel">
        <h2 className="text-lg font-semibold text-cyan-300 mb-2 tracking-wider">2. CHOOSE ACTION</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="For custom edits, describe your changes here... e.g., 'add a futuristic cityscape in the background'"
          className="w-full h-24 p-3 rounded-md focus:outline-none transition-shadow futuristic-textarea"
        />
        <div className="flex items-center justify-between mt-4 p-3 rounded-md bg-black/20 border border-cyan-500/30">
            <div className="flex flex-col">
                <span className="font-semibold text-cyan-300">High Quality Mode</span>
                <span className="text-xs text-gray-400">May increase processing time</span>
            </div>
            <label htmlFor="quality-toggle" className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isHighQuality} onChange={() => setIsHighQuality(!isHighQuality)} id="quality-toggle" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <button
                onClick={handleAnimeSubmit}
                disabled={isLoading || files.length === 0}
                className="w-full py-3 px-4 rounded-md futuristic-button"
            >
                ✨ Transform to Anime
            </button>
            <button
                onClick={handleCustomSubmit}
                disabled={isLoading || files.length === 0 || !prompt.trim()}
                className="w-full py-3 px-4 rounded-md futuristic-button"
            >
                Run Custom Edit
            </button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-900/50 text-red-200 border border-red-500/50 rounded-lg fade-in futuristic-panel">{error}</div>}

      {isLoading && <Spinner message="Applying AI edits... This may take a moment." />}

      {results.length > 0 && (
        <div className="space-y-8 fade-in">
          <h2 className="text-xl font-bold text-center text-cyan-300 tracking-widest">RESULTS</h2>
          {results.map((result, index) => (
            <div key={index} className="p-4 rounded-lg futuristic-panel fade-in" style={{ animationDelay: `${index * 150}ms` }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2 text-center">ORIGINAL</h3>
                  <img src={result.originalSrc} alt="Original" className="w-full rounded-md" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2 text-center">EDITED</h3>
                  <img src={result.editedSrc} alt="Edited" className="w-full rounded-md" style={getFilterStyle(result.activeFilter, result.blurRadius, result.saturation)} />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-cyan-500/20">
                <h4 className="text-sm font-semibold text-cyan-300 mb-3">Quick Filters</h4>
                <div className="flex flex-wrap gap-2">
                  {filters.map(f => (
                    <button
                      key={f.value}
                      onClick={() => handleFilterChange(index, f.value)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 border ${result.activeFilter === f.value ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-black/20 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20'}`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>

                {result.activeFilter === 'blur' && (
                  <div className="mt-3 flex items-center space-x-2 fade-in">
                    <span className="text-xs text-gray-400">Radius:</span>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="0.5"
                      value={result.blurRadius}
                      onChange={(e) => handleBlurChange(index, parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                )}
                {result.activeFilter === 'saturate' && (
                  <div className="mt-3 flex items-center space-x-2 fade-in">
                    <span className="text-xs text-gray-400">Level:</span>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={result.saturation}
                      onChange={(e) => handleSaturationChange(index, parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                )}
                 <div className="mt-4">
                    <a
                        href={result.editedSrc}
                        onClick={(e) => handleDownload(e, result)}
                        className="w-full sm:w-auto inline-block text-center py-2 px-4 rounded-md futuristic-button text-sm"
                    >
                        Download Image
                    </a>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageEditor;
