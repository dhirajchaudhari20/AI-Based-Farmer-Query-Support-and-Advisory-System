// Fix: Implement the full content of the Gemini service file.
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
  const fullPrompt = `Context: Location - ${context.location}, Crop - ${context.crop}. Question: ${prompt}`;

  let contents: any;

  if (imageFile) {
    const imagePart = await fileToGenerativePart(imageFile);
    const textPart = { text: fullPrompt };
    contents = { parts: [imagePart, textPart] };
  } else {
    contents = fullPrompt;
  }

  try {
    const response = await ai.models.generateContentStream({
      model: modelName,
      contents: contents,
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
