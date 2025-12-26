import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { message, history } = req.body;

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: history || [],
      config: {
        systemInstruction: "You are an expert technical recruiter at ATS Scan Pro. Be concise and helpful.",
      }
    });

    const result = await chat.sendMessage({ message });
    return res.status(200).json({ response: result.text });

  } catch (error) {
    console.error("Chat Error:", error);
    return res.status(500).json({ error: "Chat failed" });
  }
}