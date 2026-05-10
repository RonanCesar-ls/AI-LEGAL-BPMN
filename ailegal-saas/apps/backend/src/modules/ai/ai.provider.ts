import { GoogleGenerativeAI } from '@google/generative-ai';

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
  
  // Utilizamos o modelo flash por ser mais rápido e ideal para estruturação de dados e respostas imediatas (MVP)
  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite-preview",
    systemInstruction: params.system,
    generationConfig: {
      responseMimeType: params.format === 'json' ? "application/json" : "text/plain",
    }
  });

  const result = await model.generateContent(params.prompt);
  return result.response.text();
}