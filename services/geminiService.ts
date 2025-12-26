import { ATSResult } from "../types";

export const analyzeResume = async (
  jobDescription: string,
  resumeText: string
): Promise<ATSResult> => {
  
  // 1. Send data to your backend function (api/analyze.ts)
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobDescription, resumeText }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Analysis failed on server.");
  }

  return await response.json();
};

export const getChatResponse = async (
  message: string, 
  history: { role: 'user' | 'model', parts: { text: string }[] }[]
) => {
  
  try {
    // 2. Send chat history to your backend function (api/chat.ts)
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message, 
        history 
      }),
    });

    if (!response.ok) throw new Error("Chat failed");

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having trouble connecting to the server. Please try again.";
  }
};