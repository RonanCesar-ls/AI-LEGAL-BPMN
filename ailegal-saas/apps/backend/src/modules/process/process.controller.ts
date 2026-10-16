import { timelineRepository } from '../../database/timeline.repository.js';
import { timelineService } from './timeline.service.js';
import { slaService }      from './sla.service.js';
import { CorrelationService } from './correlation.service.js';
import { Request, Response } from 'express';
import fs from 'fs';
import { AIService } from '../ai/ai.service.js';
import { AIUnavailableError } from '../ai/ai.retry.js';
import { DocumentReadError, extractUploadedDocumentText } from './document-text.js';

const correlationService = new CorrelationService();
const aiService = new AIService();

function sendProcessError(res: Response, error: unknown, fallback: string) {
  if (error instanceof AIUnavailableError) {
    res.setHeader('Retry-After', String(error.retryAfter));
    return res.status(error.statusCode).json({ error: error.message, retryable: true });
  }
  if (error instanceof DocumentReadError) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  return res.status(500).json({ error: fallback });
}

const DOCUMENT_ANALYSIS_PROMPT = `You are a legal process assistant. Read the raw text from the document below and write a clear process description in Portuguese.

Focus on: who performs each action, what is done in sequence, and what decisions exist (if X happens, do Y).
Return ONLY a direct narrative paragraph in Portuguese that the user can review and edit before generating the flowchart.
Do not use bullet points, headers, or formatting — just plain flowing text describing the process.

DOCUMENT TEXT:
"`;

export const processController = {


  generate: async (req: Request, res: Response) => {
    try {
      const { prompt, sourceFileName } = req.body;

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return res.status(400).json({ error: 'O campo "prompt" é obrigatório.' });
      }

      const flowchartData = await aiService.generateFlowchartFromText(
        prompt.trim(), typeof sourceFileName === 'string' ? sourceFileName : undefined
      );

      return res.json(flowchartData);

    } catch (error) {
      console.error('[generate] Erro:', error);
      return sendProcessError(res, error, 'Falha ao gerar o fluxograma.');
    }
  },

  extractPrompt: async (req: Request, res: Response) => {
    const filePath = req.file?.path;

    try {
      if (!req.file || !filePath) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
      }

      const extractedText = await extractUploadedDocumentText(req.file);

      const safeText = extractedText.substring(0, 15000);

      const suggestedPrompt = await aiService.generateRawText(
        DOCUMENT_ANALYSIS_PROMPT + safeText + '"'
      );

      return res.json({ suggestedPrompt: suggestedPrompt.trim() });

    } catch (error) {
      console.error('[extractPrompt] Erro:', error);

      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return sendProcessError(res, error, 'Falha ao processar o arquivo.');
    }
  },

  generateBatch: async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
      }

      const results = await Promise.allSettled(
        files.map(async (file) => {
          const extractedText = await extractUploadedDocumentText(file);

          const safeText = extractedText.substring(0, 15000);
          const prompt = `You are a legal process assistant. Read the raw text from the document below and write a clear process description in Portuguese. Focus on: who performs each action, what is done in sequence, and what decisions exist. Return ONLY a direct narrative paragraph in Portuguese.\n\nDOCUMENT TEXT:\n"${safeText}"`;

          const suggestedPrompt = await aiService.generateRawText(prompt);

          return {
            fileName: file.originalname,
            suggestedPrompt: suggestedPrompt.trim(),
          };
        })
      );

      if (req.files && Array.isArray(req.files)) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
      }

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
      
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
      }
      
      return res.status(500).json({ error: 'Falha ao processar os arquivos.' });
    }
  },



  updateNodeStatus: async (req: Request, res: Response) => {
  try {
    const { nodeId }   = req.params;
    const { projectId, status, note } = req.body;

    // Actor vem do token JWT — nome real do usuário logado
    const tokenUser = (req as any).user;
    const actor     = req.body.actor && req.body.actor !== 'Usuário'
      ? req.body.actor
      : tokenUser?.name ?? 'Usuário';

    if (!projectId || !status) {
      return res.status(400).json({ error: 'projectId e status são obrigatórios.' });
    }

    // Busca o status anterior na memória
    const fromStatus = await timelineService.getCurrentStatus(projectId, nodeId);

    // 1. Salva na memória (para resposta rápida)
    const event = await timelineService.recordChange(
      projectId, nodeId, fromStatus, { status, actor, note }
    );

    // 2. Persiste no PostgreSQL (diário de bordo permanente)
    try {
      await timelineRepository.create({
        projectId,
        nodeId,
        actor,
        fromStatus: fromStatus ?? undefined,
        toStatus:   status,
        note,
      });
    } catch (dbErr) {
      // Falha no banco não quebra o fluxo — memória já foi atualizada
      console.warn('[updateNodeStatus] Falha ao persistir no banco:', (dbErr as Error).message);
    }

    // 3. Atualiza SLA
    const sla = slaService.onStatusChange(projectId, nodeId, status);

    return res.json({ event, sla });
  } catch (error) {
    console.error('[updateNodeStatus]', error);
    return res.status(500).json({ error: 'Falha ao atualizar status.' });
  }
},

  getNodeTimeline: async (req: Request, res: Response) => {
  try {
    const { nodeId }    = req.params;
    const { projectId } = req.query as { projectId: string };

    if (!projectId) {
      return res.status(400).json({ error: 'projectId é obrigatório.' });
    }

    // Tenta buscar do banco primeiro
    let timeline: any[] = [];
    try {
      const rows = await timelineRepository.findByNodeId(projectId, nodeId);
      timeline   = rows.map(r => ({
        id:         r.id,
        nodeId:     r.node_id,
        projectId:  r.project_id,
        actor:      r.actor,
        fromStatus: r.from_status,
        toStatus:   r.to_status,
        timestamp:  r.created_at,
        note:       r.note ?? undefined,
      }));
    } catch {
      // Fallback para memória se banco indisponível
      timeline = await timelineService.getTimeline(projectId, nodeId);
    }

    const sla    = slaService.getSla(projectId, nodeId);
    const status = timeline.length > 0
      ? timeline[timeline.length - 1].toStatus
      : await timelineService.getCurrentStatus(projectId, nodeId);

    return res.json({ nodeId, projectId, status, timeline, sla });
  } catch (error) {
    return res.status(500).json({ error: 'Falha ao buscar timeline.' });
  }
},

  initNodeSla: async (req: Request, res: Response) => {
    try {
      const { nodeId } = req.params;
      const { projectId, expectedMinutes } = req.body;

      if (!projectId || !expectedMinutes) {
        return res.status(400).json({ error: 'projectId e expectedMinutes são obrigatórios.' });
      }

      const sla = slaService.initSla(projectId, nodeId, expectedMinutes);
      return res.json({ nodeId, projectId, sla });
    } catch (error) {
      return res.status(500).json({ error: 'Falha ao configurar SLA.' });
    }
  },

  getProcessDiagnostic: async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const violations = slaService.getViolations(projectId);
      return res.json({ projectId, violations, totalViolations: violations.length, generatedAt: new Date().toISOString() });
    } catch (error) {
      return res.status(500).json({ error: 'Falha ao gerar diagnóstico.' });
    }
  },

  generateMerge: async (req: Request, res: Response) => {
    try {
      const { existingGraph, newDocumentText, sourceFileName } = req.body;

      // Validações
      if (!existingGraph || !Array.isArray(existingGraph.nodes) || !Array.isArray(existingGraph.edges)) {
        return res.status(400).json({ error: 'existingGraph inválido. Deve ter nodes[] e edges[].' });
      }

      if (!newDocumentText || typeof newDocumentText !== 'string' || !newDocumentText.trim()) {
        return res.status(400).json({ error: 'newDocumentText é obrigatório.' });
      }

      if (!sourceFileName || typeof sourceFileName !== 'string') {
        return res.status(400).json({ error: 'sourceFileName é obrigatório.' });
      }

      console.log(`[generateMerge] Incorporando "${sourceFileName}" ao grafo (${existingGraph.nodes.length} nós existentes)`);

      const mergedGraph = await aiService.mergeFlowchart(
        existingGraph,
        newDocumentText.trim(),
        sourceFileName
      );

      console.log(`[generateMerge] Resultado: ${mergedGraph.nodes.length} nós, ${mergedGraph.edges.length} arestas`);

      return res.json(mergedGraph);

    } catch (error) {
      console.error('[generateMerge] Erro:', error);
      return sendProcessError(res, error, 'Falha ao integrar o novo documento ao fluxograma.');
    }
  },

};
