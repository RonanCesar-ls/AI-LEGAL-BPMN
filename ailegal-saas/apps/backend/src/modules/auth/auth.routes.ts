import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
const authRoutes = Router();

authRoutes.post('/google',   authController.google);
authRoutes.get('/me',        authMiddleware, authController.me);
authRoutes.post('/verify-collaborator',   authMiddleware, authController.verifyCollaborator);

export { authRoutes };
