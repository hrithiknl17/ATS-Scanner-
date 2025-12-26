
import { GoogleGenAI, Type } from "@google/genai";
import { ATSResult } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeResume = async (
  jobDescription: string,
  resumeText: string
): Promise<ATSResult> => {
  const ai = getAIClient();
  
  const prompt = `
    Analyze the following Resume against the Job Description. 
    
    JD: ${jobDescription}
    Resume: ${resumeText}

    Your goal is to act as a senior technical recruiter and ATS specialist.
    1. Calculate a match percentage.
    2. Identify Missing Keywords.
    3. List Strengths.
    4. Provide a Summary Critique.
    5. GENERATE RECOMMENDED CHANGES: Provide 3-5 specific bullet point rewrites or section optimizations. 
       Compare the original text from the resume with your suggested high-impact, keyword-rich alternative.
    6. FULL OPTIMIZATION: Provide a fully reconstructed version of the resume text that is optimized specifically for this job description while maintaining the truth of the original candidate's experience.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "Return a JSON object only. Be highly critical and precise. The 'optimized_full_text' should be formatted nicely as a professional resume in plain text.",
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
                },
                required: ["section", "original", "suggested", "reason"]
              }
            },
            optimized_full_text: { type: Type.STRING }
          },
          required: ["match_percentage", "missing_keywords", "strengths", "summary_critique", "recommended_changes", "optimized_full_text"],
        },
      },
    });

    return JSON.parse(response.text || "{}") as ATSResult;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("Failed to analyze resume. Please try again.");
  }
};

export const getChatResponse = async (message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  const ai = getAIClient();
  
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: "You are an expert technical recruiter and career coach at ATS Scan Pro. Your goal is to help users with their job search, resume optimization, and interview prep. Keep answers professional, encouraging, but realistic. Be concise.",
      }
    });

    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having a bit of trouble connecting right now. Could you try asking that again?";
  }
};
