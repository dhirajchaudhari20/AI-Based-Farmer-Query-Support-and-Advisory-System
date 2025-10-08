import { GoogleGenAI } from "@google/genai";
import type { LanguageCode } from '../types';
import { getSystemInstruction } from '../constants';

// The API key is now read from the global window object, where it's placed by config.js at runtime.
// This is still insecure but necessary for this deployment method.
declare global {
    interface Window {
        KISSAN_MITRA_API_KEY: string;
    }
}

const apiKey = window.KISSAN_MITRA_API_KEY || process.env.API_KEY;

if (!apiKey) {
    console.error("API key is missing. Please ensure it's configured correctly for deployment.");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

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
  const userPrompt = `Context: Location - ${context.location}, Crop - ${context.crop}.\n\nQuestion: ${prompt}`;

  const parts = [];

  if (imageFile) {
    const imagePart = await fileToGenerativePart(imageFile);
    parts.push(imagePart);
  }
  
  parts.push({ text: userPrompt });

  try {
    const response = await ai.models.generateContentStream({
      model: modelName,
      // Fix: Wrap the parts array in a Content object with a specified role.
      // This more explicit structure can prevent 500 errors when combining
      // system instructions, streaming, and multipart (image + text) inputs.
      contents: { role: 'user', parts },
      config: {
          systemInstruction: systemInstruction,
      },
    });

    return response;
  } catch (error) {
    console.error("Error getting AI response stream:", error);
    throw error;
  }
};