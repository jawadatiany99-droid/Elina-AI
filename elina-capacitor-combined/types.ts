
export type View = 'editor' | 'video';

export interface ImageResult {
  originalSrc: string;
  editedSrc:string;
  activeFilter: 'none' | 'grayscale' | 'sepia' | 'invert' | 'blur' | 'saturate';
  blurRadius: number;
  saturation: number;
}