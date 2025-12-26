import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

// Initialize client with SERVER-SIDE key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { jobDescription, resumeText } = req.body;

  if (!jobDescription || !resumeText) {
    return res.status(400).json({ error: 'Missing data' });
  }

  try {
    const prompt = `
      Analyze the following Resume against the Job Description. 
      
      JD: ${jobDescription}
      Resume: ${resumeText}

      Your goal is to act as a senior technical recruiter.
      1. Calculate match percentage.
      2. Identify Missing Keywords.
      3. List Strengths.
      4. Provide a Summary Critique.
      5. Generate RECOMMENDED CHANGES (3-5 items).
      6. Generate OPTIMIZED FULL TEXT (Rewrite the resume).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Or 'gemini-1.5-flash' if preferred
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            match_percentage: { type: Type.INTEGER },
            missing_keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary_critique: { type: Type.STRING },
            recommended_changes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  section: { type: Type.STRING },
                  original: { type: Type.STRING },
                  suggested: { type: Type.STRING },
                  reason: { type: Type.STRING }
                }
              }
            },
            optimized_full_text: { type: Type.STRING }
          }
        },
      },
    });

    // Send the clean JSON back to the frontend
    const data = JSON.parse(response.text || "{}");
    return res.status(200).json(data);

  } catch (error: any) {
    console.error("Backend Analysis Error:", error);
    return res.status(500).json({ error: "Failed to analyze resume" });
  }
}