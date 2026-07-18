import { Router } from 'express';
import { tasksController } from './tasks.controller.js';

const tasksRoutes = Router();

tasksRoutes.get('/',                          tasksController.list);
tasksRoutes.post('/',                         tasksController.create);
tasksRoutes.patch('/reallocate',              tasksController.reallocate);
tasksRoutes.post('/generate-from-project',    tasksController.generateFromProject);
tasksRoutes.post('/insight',                  tasksController.getInsight);
tasksRoutes.get('/audit',                     tasksController.getTeamAudit);
tasksRoutes.get('/metrics',                   tasksController.getMetrics);
tasksRoutes.get('/events',                    tasksController.sseEvents);
//Rotas dinamicas para auditoria de projetos, com userId como parâmetro
tasksRoutes.get('/audit/:userId',             tasksController.getAudit);
tasksRoutes.patch('/:id',                     tasksController.update);
tasksRoutes.delete('/:id',                    tasksController.remove);

export { tasksRoutes };