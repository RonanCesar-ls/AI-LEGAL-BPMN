import { Router } from 'express';
import { trackingController } from './tracking.controller.js';

const trackingRoutes = Router();

// Estáticas primeiro
trackingRoutes.get('/status',  trackingController.getStatus);
trackingRoutes.patch('/status', trackingController.setStatus);
trackingRoutes.get('/team',    trackingController.getTeam);
trackingRoutes.post('/',       trackingController.track);
trackingRoutes.get('/',        trackingController.getByUser);

export { trackingRoutes };