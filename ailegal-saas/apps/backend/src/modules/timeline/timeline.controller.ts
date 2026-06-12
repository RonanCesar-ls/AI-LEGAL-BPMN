import { Request, Response } from 'express';
import { timelineRepository } from '../../database/timeline.repository.js';

export const timelineController = {

  // POST /api/timeline — registra evento no diário de bordo
  create: async (req: Request, res: Response) => {
    try {
      const { projectId, nodeId, nodeLabel, actor, fromStatus, toStatus, note } = req.body;

      if (!projectId || !nodeId || !actor || !toStatus) {
        return res.status(400).json({ error: 'projectId, nodeId, actor e toStatus são obrigatórios.' });
      }

      const event = await timelineRepository.create({
        projectId, nodeId, nodeLabel, actor, fromStatus, toStatus, note,
      });

      return res.status(201).json(event);
    } catch (err) {
      console.error('[timeline.create]', err);
      return res.status(500).json({ error: 'Falha ao registrar evento.' });
    }
  },

  // GET /api/timeline/:projectId — diário de bordo completo
  getByProject: async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const events = await timelineRepository.findByProjectId(projectId);
      return res.json(events);
    } catch (err) {
      console.error('[timeline.getByProject]', err);
      return res.status(500).json({ error: 'Falha ao buscar diário de bordo.' });
    }
  },

  // GET /api/timeline/:projectId/node/:nodeId — timeline de um nó
  getByNode: async (req: Request, res: Response) => {
    try {
      const { projectId, nodeId } = req.params;
      const events = await timelineRepository.findByNodeId(projectId, nodeId);
      return res.json(events);
    } catch (err) {
      console.error('[timeline.getByNode]', err);
      return res.status(500).json({ error: 'Falha ao buscar timeline do nó.' });
    }
  },

  // GET /api/timeline/:projectId/bottlenecks — gargalos do processo
  getBottlenecks: async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const bottlenecks = await timelineRepository.getBottlenecks(projectId);
      return res.json(bottlenecks);
    } catch (err) {
      console.error('[timeline.getBottlenecks]', err);
      return res.status(500).json({ error: 'Falha ao buscar gargalos.' });
    }
  },
};