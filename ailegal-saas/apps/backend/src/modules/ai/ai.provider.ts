import { GoogleGenerativeAI } from '@google/generative-ai';
import { withAIRetry } from './ai.retry.js';

interface GenerateTextParams {
  prompt: string;
  system: string;
  format?: 'json' | 'text';
}

export async function generateText(params: GenerateTextParams): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("A variável GEMINI_API_KEY não está configurada no ficheiro .env");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    systemInstruction: params.system,
    generationConfig: {
      responseMimeType: params.format === 'json' ? "application/json" : "text/plain",
    }
  });

  const result = await withAIRetry(() => model.generateContent(params.prompt));
  return result.response.text();
}
