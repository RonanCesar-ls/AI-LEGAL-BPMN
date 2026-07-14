import { Request, Response } from 'express';
import { taskRepository, taskAuditRepository } from '../../database/task.repository.js';
import { pool } from '../../database/connection.js';
import { AIService } from '../ai/ai.service.js';

const aiService = new AIService();

export const tasksController = {

  list: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user?.userId) return res.status(401).json({ error: 'Não autorizado.' });

      const { from, to, userId } = req.query as { from?: string; to?: string; userId?: string };

      const targetUserId = userId || user.userId;

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
      const loggedUser = (req as any).user;
      const { id }     = req.params;
      const { title, description, taskDate, status, actingAsId, actingAsName } = req.body;

      // Busca a tarefa antes de alterar pra pegar o status anterior
      const before = await taskRepository.findById(id);

      const updated = await taskRepository.update(id, before?.user_id ?? loggedUser.userId, {
        title, description, taskDate, status,
      });

      if (!updated) return res.status(404).json({ error: 'Tarefa não encontrada.' });

      // Registra no log de auditoria
      await taskAuditRepository.create({
        taskId:        id,
        actorId:       loggedUser.userId,
        actorName:     loggedUser.name,
        actingAsId,
        actingAsName,
        action:        'update_status',
        fromStatus:    before?.status,
        toStatus:      status,
        taskTitle:     before?.title,
      });

      return res.json({
        id: updated.id, title: updated.title,
        status: updated.status, taskDate: updated.task_date,
        updatedAt: updated.updated_at,
      });
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
      const loggedUser = (req as any).user;
      const { id }     = req.params;
      const { actingAsId, actingAsName } = req.query as { actingAsId?: string; actingAsName?: string };

      const before  = await taskRepository.findById(id);
      const deleted = await taskRepository.delete(id, before?.user_id ?? loggedUser.userId);

      if (!deleted) return res.status(404).json({ error: 'Tarefa não encontrada.' });

      await taskAuditRepository.create({
        taskId:       id,
        actorId:      loggedUser.userId,
        actorName:    loggedUser.name,
        actingAsId,
        actingAsName,
        action:       'delete',
        taskTitle:    before?.title,
      });

      return res.json({ ok: true });
    } catch (err) {
      console.error('[tasks.remove]', err);
      return res.status(500).json({ error: 'Falha ao deletar tarefa.' });
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

  getInsight: async (req: Request, res: Response) => {
    try {
      const { userId, taskDate } = req.body;
      const loggedUserId = (req as any).user.userId;
      const targetUserId = userId ?? loggedUserId;

      const todayTasks = await taskRepository.findByUserAndDateRange(
        targetUserId, taskDate, taskDate
      );

      const avgPerDay = await taskRepository.getCompletionAverage(targetUserId, 30);

      const totalToday    = todayTasks.length;
      const doneToday     = todayTasks.filter((t: any) => t.status === 'done').length;
      const blockedToday  = todayTasks.filter((t: any) => t.status === 'blocked').length;
      const pendingToday  = todayTasks.filter((t: any) => t.status === 'todo' || t.status === 'in_progress').length;

      const userResult = await pool.query(
        'SELECT name FROM users WHERE id = $1', [targetUserId]
      );
      const collaboratorName = userResult.rows[0]?.name ?? 'o colaborador';

      const context = `Você é um assistente de gestão de processos jurídicos. Analise os dados abaixo e gere um insight curto e direto (máximo 3 frases) sobre o risco de atraso do colaborador hoje. Escreva em português, tom profissional mas acessível. Termine sempre com uma recomendação de ação concreta.
      
      DADOS DO DIA (${taskDate}):
      - Colaborador: ${collaboratorName}
      - Total de tarefas hoje: ${totalToday}
      - Concluídas: ${doneToday}
      - Pendentes: ${pendingToday}
      - Impedidas: ${blockedToday}
      - Média histórica de tarefas concluídas por dia: ${avgPerDay.toFixed(1)}
      
      REGRAS:
      - Se pendingToday > avgPerDay * 1.5, classifique como RISCO ALTO
      - Se pendingToday > avgPerDay, classifique como RISCO MÉDIO  
      - Caso contrário, classifique como DENTRO DO ESPERADO
      - Se houver tarefas bloqueadas, mencione isso como ponto crítico
      - Sugira realocar as tarefas excedentes para o próximo dia útil se o risco for alto`.trim();

      const insightText = await aiService.generateRawText(context);

      const riskLevel = pendingToday > avgPerDay * 1.5 ? 'high'
        : pendingToday > avgPerDay ? 'medium'
        : 'low';

      const tasksToReallocate = riskLevel === 'high'
        ? todayTasks
            .filter((t: any) => t.status === 'todo')
            .slice(Math.floor(avgPerDay))
            .map((t: any) => t.id)
        : [];

      return res.json({
        insight:            insightText.trim(),
        riskLevel,
        stats: {
          totalToday, doneToday, pendingToday, blockedToday,
          avgPerDay: parseFloat(avgPerDay.toFixed(1)),
        },
        tasksToReallocate,
        collaboratorName,
      });
    } catch (err) {
      console.error('[tasks.getInsight]', err);
      return res.status(500).json({ error: 'Falha ao gerar insight.' });
    }
  },

  // GET /api/tasks/audit/:userId
  getAudit: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const logs = await taskAuditRepository.findByUser(userId);

      return res.json(logs.map(l => ({
        id:            l.id,
        taskId:        l.task_id,
        actorName:     l.actor_name,
        actingAsName:  l.acting_as_name,
        action:        l.action,
        fromStatus:    l.from_status,
        toStatus:      l.to_status,
        taskTitle:     l.task_title,
        note:          l.note,
        createdAt:     l.created_at,
        // Texto formatado pra exibir direto na UI
        description:   l.acting_as_name
          ? `${l.actor_name} (como ${l.acting_as_name})`
          : l.actor_name,
      })));
    } catch (err) {
      console.error('[tasks.getAudit]', err);
      return res.status(500).json({ error: 'Falha ao buscar histórico.' });
    }
  },
};
