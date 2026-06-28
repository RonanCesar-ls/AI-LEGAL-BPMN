import { Router } from 'express';
import { tasksController } from './tasks.controller.js';

const tasksRoutes = Router();

tasksRoutes.get('/',             tasksController.list);
tasksRoutes.post('/',            tasksController.create);
tasksRoutes.patch('/reallocate', tasksController.reallocate);
tasksRoutes.patch('/:id',        tasksController.update);
tasksRoutes.delete('/:id',       tasksController.remove);

export { tasksRoutes };