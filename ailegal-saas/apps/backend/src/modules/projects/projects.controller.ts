import { Request, Response } from 'express';
import { projectRepository } from '../../database/project.repository.js';

export const projectsController = {

  list: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user?.userId) {
        return res.status(401).json({ error: 'Não autorizado.' });
      }

      const projects = await projectRepository.findByUserId(user.userId);

      return res.json(projects.map(p => ({
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
      })));
    } catch (err) {
      console.error('[projects.list]', err);
      return res.status(500).json({ error: 'Falha ao buscar projetos.' });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user?.userId) {
        return res.status(401).json({ error: 'Não autorizado.' });
      }

      const { name, type, status, promptText, nodes, edges, processingQueue } = req.body;

      if (!name) return res.status(400).json({ error: 'name é obrigatório.' });

      const project = await projectRepository.create({
        userId: user.userId, name, type, status, promptText, nodes, edges, processingQueue,
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

  update: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user?.userId) {
        return res.status(401).json({ error: 'Não autorizado.' });
      }

      const { id } = req.params;
      const { name, type, status, promptText, nodes, edges, processingQueue } = req.body;

      const updated = await projectRepository.update(id, user.userId, {
        name, type, status, promptText, nodes, edges, processingQueue,
      });

      if (!updated) return res.status(404).json({ error: 'Projeto não encontrado.' });

      return res.json({ ok: true, updatedAt: updated.updated_at });
    } catch (err) {
      console.error('[projects.update]', err);
      return res.status(500).json({ error: 'Falha ao salvar projeto.' });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user?.userId) {
        return res.status(401).json({ error: 'Não autorizado.' });
      }

      const { id }  = req.params;
      const deleted = await projectRepository.delete(id, user.userId);

      if (!deleted) return res.status(404).json({ error: 'Projeto não encontrado.' });

      return res.json({ ok: true });
    } catch (err) {
      console.error('[projects.remove]', err);
      return res.status(500).json({ error: 'Falha ao deletar projeto.' });
    }
  },
};