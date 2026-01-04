import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateFortune = async (wish: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The user has made a New Year's wish for 2026: "${wish}". 
      Act as a mystical digital oracle from the future (year 2026). 
      Write a short, poetic, and inspiring fortune or prediction (max 30 words) related to this wish. 
      The tone should be hopeful, slightly futuristic, and magical.
      Return ONLY the plain text of the fortune.`,
    });
    
    return response.text?.trim() || "The stars are aligning for your bright future in 2026.";
  } catch (error) {
    console.error("Error generating fortune:", error);
    return "Your wish has been sent to the stars. May 2026 bring you endless joy.";
  }
};
