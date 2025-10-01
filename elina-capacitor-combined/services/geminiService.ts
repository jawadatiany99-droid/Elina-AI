
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = (error) => reject(error);
  });
};

export const editImage = async (file: File, prompt: string): Promise<string> => {
    const { base64, mimeType } = await fileToBase64(file);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64,
                        mimeType: mimeType,
                    },
                },
                {
                    text: prompt,
                },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }
    
    throw new Error("No image was generated. The model may have refused the prompt.");
};


const videoGenerationMessages = [
    "Warming up the creative engine...",
    "Directing the virtual camera...",
    "Rendering the first few frames...",
    "Mixing digital colors...",
    "Animating the scene...",
    "This is taking a bit longer than usual, but good things are coming...",
    "Adding cinematic magic...",
    "Finalizing the video output..."
];

export const generateVideo = async (
    file: File, 
    prompt: string, 
    onProgress: (message: string) => void
): Promise<string> => {
    const { base64, mimeType } = await fileToBase64(file);
    
    onProgress("Initializing video generation...");

    let operation = await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: prompt,
        image: {
            imageBytes: base64,
            mimeType: mimeType,
        },
        config: {
            numberOfVideos: 1
        }
    });

    let messageIndex = 0;
    while (!operation.done) {
        onProgress(videoGenerationMessages[messageIndex % videoGenerationMessages.length]);
        messageIndex++;
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    
    onProgress("Fetching generated video...");

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
        throw new Error("Video generation failed or returned no link.");
    }
    
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const videoBlob = await response.blob();
    return URL.createObjectURL(videoBlob);
};
