import { CorrelationService } from './correlation.service.js';
import { Request, Response } from 'express';
import fs from 'fs';
import mammoth from 'mammoth';
import { AIService } from '../ai/ai.service.js';

const correlationService = new CorrelationService();
const aiService = new AIService();

// Prompt para análise de documento RCC → gera rascunho de texto
const DOCUMENT_ANALYSIS_PROMPT = `You are a legal process assistant. Read the raw text from the document below and write a clear process description in Portuguese.

Focus on: who performs each action, what is done in sequence, and what decisions exist (if X happens, do Y).
Return ONLY a direct narrative paragraph in Portuguese that the user can review and edit before generating the flowchart.
Do not use bullet points, headers, or formatting — just plain flowing text describing the process.

DOCUMENT TEXT:
"`;

export const processController = {

  // ─── ROTA: POST /api/process/generate ─────────────────────────────────────
  generate: async (req: Request, res: Response) => {
    try {
      const { prompt } = req.body;

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return res.status(400).json({ error: 'O campo "prompt" é obrigatório.' });
      }

      const flowchartData = await aiService.generateFlowchartFromText(prompt.trim());

      return res.json(flowchartData);

    } catch (error) {
      console.error('[generate] Erro:', error);
      return res.status(500).json({ 
        error: 'Falha ao gerar o fluxograma.',
        detail: error instanceof Error ? error.message : String(error)
      });
    }
  },

  // ─── ROTA: POST /api/process/extract-prompt ────────────────────────────────
  extractPrompt: async (req: Request, res: Response) => {
    const filePath = req.file?.path;

    try {
      if (!req.file || !filePath) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
      }

      const originalName = req.file.originalname.toLowerCase();
      const fileType    = req.file.mimetype;
      let extractedText = '';

      // ── Extrai texto do PDF ──────────────────────────────────────────────
      if (fileType === 'application/pdf' || originalName.endsWith('.pdf')) {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfParseModule = (await import('pdf-parse')) as any;
        const pdfParse = pdfParseModule.default ?? pdfParseModule;
        const data = await pdfParse(dataBuffer);
        extractedText = data.text;
      }
      // ── Extrai texto do DOCX ─────────────────────────────────────────────
      else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        originalName.endsWith('.docx')
      ) {
        const result = await mammoth.extractRawText({ path: filePath });
        extractedText = result.value;
      }
      else {
        return res.status(400).json({ error: 'Formato não suportado. Envie PDF ou DOCX.' });
      }

      // Apaga arquivo temporário assim que texto é extraído
      fs.unlinkSync(filePath);

      if (!extractedText.trim()) {
        return res.status(422).json({ 
          error: 'O arquivo não contém texto legível. Verifique se não é um PDF escaneado.' 
        });
      }

      // Limita tokens — 15k chars é ~3.7k tokens, seguro pra Gemini Flash
      const safeText = extractedText.substring(0, 15000);

      // ── Chama a IA de verdade ────────────────────────────────────────────
      // generateText é o método raw do seu ai.provider.ts
      // que retorna texto puro (não JSON)
      const suggestedPrompt = await aiService.generateRawText(
        DOCUMENT_ANALYSIS_PROMPT + safeText + '"'
      );

      return res.json({ suggestedPrompt: suggestedPrompt.trim() });

    } catch (error) {
      console.error('[extractPrompt] Erro:', error);

      // Garante limpeza do arquivo mesmo em caso de erro
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return res.status(500).json({ 
        error: 'Falha ao processar o arquivo.',
        detail: error instanceof Error ? error.message : String(error)
      });
    }
  },
  generateBatch: async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    // Processa todos os arquivos em paralelo
    const results = await Promise.allSettled(
      files.map(async (file) => {
        const originalName = file.originalname.toLowerCase();
        let extractedText = '';

        if (file.mimetype === 'application/pdf' || originalName.endsWith('.pdf')) {
          const dataBuffer = fs.readFileSync(file.path);
          const pdfParseModule = (await import('pdf-parse')) as any;
          const pdfParse = pdfParseModule.default ?? pdfParseModule;
          const data = await pdfParse(dataBuffer);
          extractedText = data.text;
        } else if (
          file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          originalName.endsWith('.docx')
        ) {
          const result = await mammoth.extractRawText({ path: file.path });
          extractedText = result.value;
        }

        fs.unlinkSync(file.path);

        const safeText = extractedText.substring(0, 15000);
        const prompt = `You are a legal process assistant. Read the raw text from the document below and write a clear process description in Portuguese. Focus on: who performs each action, what is done in sequence, and what decisions exist. Return ONLY a direct narrative paragraph in Portuguese.\n\nDOCUMENT TEXT:\n"${safeText}"`;

        const suggestedPrompt = await aiService.generateRawText(prompt);

        return {
          fileName: file.originalname,
          suggestedPrompt: suggestedPrompt.trim(),
        };
      })
    );

    // Limpa arquivos que possam ter sobrado em caso de erro
    files.forEach(file => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });

    const successful = results
      .filter(r => r.status === 'fulfilled')
      .map(r => (r as PromiseFulfilledResult<any>).value);

    const failed = results
      .filter(r => r.status === 'rejected')
      .length;

    return res.json({
      results: successful,
      failed,
      total: files.length,
    });

  } catch (error) {
    console.error('[generateBatch] Erro:', error);
    return res.status(500).json({ error: 'Falha ao processar os arquivos.' });
  }
}
};