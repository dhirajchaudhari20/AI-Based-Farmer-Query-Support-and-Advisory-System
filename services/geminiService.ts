import { GoogleGenAI } from "@google/genai";
import type { LanguageCode } from '../types';
import { getSystemInstruction } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      if (base64Data) {
        resolve(base64Data);
      } else {
        reject(new Error("Failed to read file as base64"));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const getAIResponse = async (
  prompt: string,
  imageFile: File | null,
  context: { location: string; crop: string },
  language: LanguageCode
) => {
  const modelName = 'gemini-2.5-flash';
  
  const systemInstruction = getSystemInstruction(language);
  // Combine system instruction and user prompt into a single text block.
  // This is a more robust way to provide instructions and fixes the streaming error.
  const fullPrompt = `${systemInstruction}\n\n---\n\nContext: Location - ${context.location}, Crop - ${context.crop}.\n\nQuestion: ${prompt}`;

  let contents: any;

  if (imageFile) {
    const imagePart = await fileToGenerativePart(imageFile);
    // For multimodal requests, the prompt goes in a separate text part.
    const textPart = { text: fullPrompt };
    contents = { parts: [imagePart, textPart] };
  } else {
    // For text-only requests, the entire prompt is the content.
    contents = fullPrompt;
  }

  try {
    // Removed the 'config' object with systemInstruction to fix the streaming error.
    // The instruction is now part of the main prompt.
    const response = await ai.models.generateContentStream({
      model: modelName,
      contents: contents,
    });

    return response;
  } catch (error) {
    console.error("Error getting AI response stream:", error);
    throw error;
  }
};
