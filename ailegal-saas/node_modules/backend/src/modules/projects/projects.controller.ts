import { Request, Response } from 'express';
import { projectRepository } from '../../database/project.repository.js';

export const projectsController = {

  // GET /api/projects — lista projetos do usuário
  list: async (req: Request, res: Response) => {
    try {
      // TODO: pegar userId do JWT — por ora usa query param para testar
      const userId = req.query.userId as string;
      if (!userId) return res.status(400).json({ error: 'userId é obrigatório.' });

      const projects = await projectRepository.findByUserId(userId);

      // Converte snake_case do banco para camelCase do frontend
      const formatted = projects.map(p => ({
        id:              p.id,
        userId:          p.user_id,
        name:            p.name,
        type:            p.type,
        status:          p.status,
        promptText:      p.prompt_text ?? '',
        nodes:           p.nodes,
        edges:           p.edges,
        processingQueue: p.processing_queue,
        aiLog:           [],
        createdAt:       p.created_at,
        updatedAt:       p.updated_at,
      }));

      return res.json(formatted);
    } catch (err) {
      console.error('[projects.list]', err);
      return res.status(500).json({ error: 'Falha ao buscar projetos.' });
    }
  },

  // POST /api/projects — cria projeto
  create: async (req: Request, res: Response) => {
    try {
      const { userId, name, type, status, promptText, nodes, edges, processingQueue } = req.body;
      if (!userId || !name) return res.status(400).json({ error: 'userId e name são obrigatórios.' });

      const project = await projectRepository.create({
        userId, name, type, status, promptText, nodes, edges, processingQueue,
      });

      return res.status(201).json({
        id:              project.id,
        userId:          project.user_id,
        name:            project.name,
        type:            project.type,
        status:          project.status,
        promptText:      project.prompt_text ?? '',
        nodes:           project.nodes,
        edges:           project.edges,
        processingQueue: project.processing_queue,
        aiLog:           [],
        createdAt:       project.created_at,
        updatedAt:       project.updated_at,
      });
    } catch (err) {
      console.error('[projects.create]', err);
      return res.status(500).json({ error: 'Falha ao criar projeto.' });
    }
  },

  // PATCH /api/projects/:id — salva fluxograma gerado
  update: async (req: Request, res: Response) => {
    try {
      const { id }    = req.params;
      const { userId, ...data } = req.body;

      if (!userId) return res.status(400).json({ error: 'userId é obrigatório.' });

      const updated = await projectRepository.update(id, userId, {
        name:            data.name,
        type:            data.type,
        status:          data.status,
        promptText:      data.promptText,
        nodes:           data.nodes,
        edges:           data.edges,
        processingQueue: data.processingQueue,
      });

      if (!updated) return res.status(404).json({ error: 'Projeto não encontrado.' });

      return res.json({ ok: true, updatedAt: updated.updated_at });
    } catch (err) {
      console.error('[projects.update]', err);
      return res.status(500).json({ error: 'Falha ao salvar projeto.' });
    }
  },

  // DELETE /api/projects/:id — deleta projeto
  remove: async (req: Request, res: Response) => {
    try {
      const { id }    = req.params;
      const { userId } = req.query as { userId: string };

      if (!userId) return res.status(400).json({ error: 'userId é obrigatório.' });

      const deleted = await projectRepository.delete(id, userId);
      if (!deleted) return res.status(404).json({ error: 'Projeto não encontrado.' });

      return res.json({ ok: true });
    } catch (err) {
      console.error('[projects.remove]', err);
      return res.status(500).json({ error: 'Falha ao deletar projeto.' });
    }
  },
};