import { Router } from 'express';
import { projectsController } from './projects.controller.js';

const projectsRoutes = Router();

projectsRoutes.get('/',     projectsController.list);
projectsRoutes.post('/',    projectsController.create);
projectsRoutes.patch('/:id', projectsController.update);
projectsRoutes.delete('/:id', projectsController.remove);

export { projectsRoutes };