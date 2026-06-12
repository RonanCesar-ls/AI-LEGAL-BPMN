import { Router } from 'express';
import { timelineController } from './timeline.controller.js';

const timelineRoutes = Router();

timelineRoutes.post('/',                          timelineController.create);
timelineRoutes.get('/:projectId',                 timelineController.getByProject);
timelineRoutes.get('/:projectId/node/:nodeId',    timelineController.getByNode);
timelineRoutes.get('/:projectId/bottlenecks',     timelineController.getBottlenecks);

export { timelineRoutes };