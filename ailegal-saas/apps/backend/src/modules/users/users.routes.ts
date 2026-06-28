import { Router } from 'express';
import { usersController } from './users.controller.js';

const usersRoutes = Router();
usersRoutes.get('/', usersController.list);

export { usersRoutes };