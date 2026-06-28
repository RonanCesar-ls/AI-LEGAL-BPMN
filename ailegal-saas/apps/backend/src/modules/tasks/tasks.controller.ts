import { Request, Response } from 'express';
import { taskRepository } from '../../database/task.repository.js';

export const tasksController = {

  list: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const { from, to } = req.query as { from: string; to: string };

      if (!from || !to) {
        return res.status(400).json({ error: 'Parâmetros "from" e "to" são obrigatórios.' });
      }

      const tasks = await taskRepository.findByUserAndDateRange(userId, from, to);

      return res.json(tasks.map(t => ({
        id:          t.id,
        userId:      t.user_id,
        title:       t.title,
        description: t.description ?? '',
        taskDate:    t.task_date,
        status:      t.status,
        projectId:   t.project_id,
        nodeId:      t.node_id,
        createdAt:   t.created_at,
        updatedAt:   t.updated_at,
      })));
    } catch (err) {
      console.error('[tasks.list]', err);
      return res.status(500).json({ error: 'Falha ao buscar tarefas.' });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const { title, description, taskDate, status, projectId, nodeId, assignedTo } = req.body;

      if (!title || !taskDate) {
        return res.status(400).json({ error: 'title e taskDate são obrigatórios.' });
      }

      const task = await taskRepository.create({
        userId:      assignedTo ?? userId,
        createdBy:   userId,
        title,
        description,
        taskDate,
        status,
        projectId,
        nodeId,
      });

      return res.status(201).json({
        id: task.id, userId: task.user_id, title: task.title,
        description: task.description ?? '', taskDate: task.task_date,
        status: task.status, projectId: task.project_id, nodeId: task.node_id,
      });
    } catch (err) {
      console.error('[tasks.create]', err);
      return res.status(500).json({ error: 'Falha ao criar tarefa.' });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const { id }  = req.params;
      const { title, description, taskDate, status } = req.body;

      const updated = await taskRepository.update(id, userId, {
        title, description, taskDate, status,
      });

      if (!updated) return res.status(404).json({ error: 'Tarefa não encontrada.' });

      return res.json({
        id: updated.id, title: updated.title, status: updated.status,
        taskDate: updated.task_date, updatedAt: updated.updated_at,
      });
    } catch (err) {
      console.error('[tasks.update]', err);
      return res.status(500).json({ error: 'Falha ao atualizar tarefa.' });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const { id }  = req.params;

      const deleted = await taskRepository.delete(id, userId);
      if (!deleted) return res.status(404).json({ error: 'Tarefa não encontrada.' });

      return res.json({ ok: true });
    } catch (err) {
      console.error('[tasks.remove]', err);
      return res.status(500).json({ error: 'Falha ao deletar tarefa.' });
    }
  },

  reallocate: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const { taskIds, newDate } = req.body;

      if (!Array.isArray(taskIds) || taskIds.length === 0 || !newDate) {
        return res.status(400).json({ error: 'taskIds (array) e newDate são obrigatórios.' });
      }

      const count = await taskRepository.reallocateMany(taskIds, userId, newDate);

      return res.json({ ok: true, reallocated: count, newDate });
    } catch (err) {
      console.error('[tasks.reallocate]', err);
      return res.status(500).json({ error: 'Falha ao realocar tarefas.' });
    }
  },
};