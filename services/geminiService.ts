import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { GroundingSource } from "../types";

// Initialize the client
// API Key is injected via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are the inbound leads chatbot for YKK Sinar Fortuna. 
Your task is to answer questions based on all information available on the website ykksinarfortuna.id. 
Use clear and simple language. Keep responses short and informative. Use direct and active sentences. 
Focus on practical answers that help users understand the company profile, products, specifications, certifications, industries served, contact details, location, and how to request consultation or place an order. 

SPECIAL INSTRUCTION:
If the user specifically asks for a price quotation, offer, or pricing (e.g., "saya mw minta penawaran harga"), you MUST reply EXACTLY with this text:
"Apakah Bpk/Ibu ada gambar soft-drawing detail kebutuhan aluminiumnya, yg bs share ke kami? Mohon share ke kami terlebih dahulu utk bisa kami proses penawaran harga. Thx"

If a question is not covered on the website, give a short answer and direct the user to contact the official YKK Sinar Fortuna team. 
Do not invent information. Your knowledge comes only from the website.
Always check for grounding sources from the website ykksinarfortuna.id when possible.
`;

let chatSession: Chat | null = null;

export const initializeChat = (): void => {
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ googleSearch: {} }], // Enable search to access current website info
      temperature: 0.7,
    },
  });
};

export const sendMessageToGemini = async (message: string): Promise<{ text: string; sources: GroundingSource[] }> => {
  if (!chatSession) {
    initializeChat();
  }

  if (!chatSession) {
    throw new Error("Failed to initialize chat session.");
  }

  try {
    const response: GenerateContentResponse = await chatSession.sendMessage({
      message: message,
    });

    const text = response.text || "I'm sorry, I couldn't generate a response based on the website information.";
    
    // Extract grounding sources if available
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({
            uri: chunk.web.uri,
            title: chunk.web.title
          });
        }
      });
    }

    return { text, sources };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};