import { Request, Response } from 'express';
import { taskRepository } from '../../database/task.repository.js';
import { pool } from '../../database/connection.js';

export const tasksController = {

  
  list: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user?.userId) return res.status(401).json({ error: 'Não autorizado.' });

      const { from, to, userId } = req.query as { from?: string; to?: string; userId?: string };

      const targetUserId = userId || user.userId; // permite ver tarefas de outro colaborador

      const today = new Date();
      const todayLocal = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const tasks = await taskRepository.findByUserAndDateRange(
        targetUserId,
        from || todayLocal,
        to || todayLocal
      );

      return res.json(tasks);
    } catch (err) {
      console.error('[tasks.list]', err);
      return res.status(500).json({ error: 'Falha ao buscar tarefas.' });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user?.userId) return res.status(401).json({ error: 'Não autorizado.' });

      const { title, description, taskDate, status, projectId, nodeId } = req.body;

      if (!title || !taskDate) {
        return res.status(400).json({ error: 'Título e data da tarefa são obrigatórios.' });
      }

      const task = await taskRepository.create({
        userId: user.userId,
        createdBy: user.userId,
        title,
        description,
        taskDate,
        status,
        projectId,
        nodeId
      });

      return res.status(201).json(task);
    } catch (err) {
      console.error('[tasks.create]', err);
      return res.status(500).json({ error: 'Falha ao criar tarefa.' });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user?.userId) return res.status(401).json({ error: 'Não autorizado.' });

      const { id } = req.params;
      const { title, description, taskDate, status } = req.body;

      const updated = await taskRepository.update(id, user.userId, {
        title, description, taskDate, status
      });

      if (!updated) return res.status(404).json({ error: 'Tarefa não encontrada.' });

      return res.json(updated);
    } catch (err) {
      console.error('[tasks.update]', err);
      return res.status(500).json({ error: 'Falha ao atualizar tarefa.' });
    }
  },

  reallocate: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user?.userId) return res.status(401).json({ error: 'Nao autorizado.' });

      const { taskIds, newDate } = req.body;

      if (!Array.isArray(taskIds) || taskIds.length === 0 || !newDate) {
        return res.status(400).json({ error: 'taskIds e newDate sao obrigatorios.' });
      }

      const updatedCount = await taskRepository.reallocateMany(taskIds, user.userId, newDate);

      return res.json({ ok: true, updatedCount });
    } catch (err) {
      console.error('[tasks.reallocate]', err);
      return res.status(500).json({ error: 'Falha ao realocar tarefas.' });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user?.userId) return res.status(401).json({ error: 'Nao autorizado.' });

      const { id } = req.params;
      const deleted = await taskRepository.delete(id, user.userId);

      if (!deleted) return res.status(404).json({ error: 'Tarefa nao encontrada.' });

      return res.json({ ok: true });
    } catch (err) {
      console.error('[tasks.remove]', err);
      return res.status(500).json({ error: 'Falha ao remover tarefa.' });
    }
  },

  generateFromProject: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const { projectId, taskDate } = req.body;

      if (!projectId || !taskDate) {
        return res.status(400).json({ error: 'projectId e taskDate são obrigatórios.' });
      }

      const projectResult = await pool.query(
        'SELECT nodes FROM projects WHERE id = $1',
        [projectId]
      );

      if (projectResult.rows.length === 0) {
        return res.status(404).json({ error: 'Projeto não encontrado.' });
      }

      const nodes = projectResult.rows[0].nodes ?? [];
      const taskNodes = nodes.filter((n: any) =>
        n.type === 'task' && n.data?.status !== 'done'
      );

      const created = [];
      const skipped = [];

      for (const node of taskNodes) {
        const alreadyExists = await taskRepository.existsForNodeAndDate(projectId, node.id, taskDate);
        if (alreadyExists) {
          skipped.push(node.data?.label ?? node.id);
          continue;
        }

        const actorName = node.data?.actor;
        const matchedUser = actorName ? await taskRepository.findUserByName(actorName) : null;
        
        const assignedUserId = matchedUser?.id ?? userId; 

        const task = await taskRepository.create({
          userId:      assignedUserId,
          createdBy:   userId,
          title:       node.data?.label ?? 'Tarefa sem título',
          description: matchedUser ? undefined : `Responsável original: ${actorName ?? 'não definido'}`,
          taskDate,
          status:      'todo',
          projectId,
          nodeId:      node.id,
        });

        created.push(task);
      }

      return res.json({
        createdCount: created.length,
        skippedCount: skipped.length,
        skipped,
        tasks: created,
      });
    } catch (err) {
      console.error('[tasks.generateFromProject]', err);
      return res.status(500).json({ error: 'Falha ao gerar tarefas a partir do fluxograma.' });
    }
  },

};
