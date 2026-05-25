import { Router } from 'express';
import multer from 'multer';
import { processController } from './process.controller.js';

const upload = multer({ dest: 'uploads/' });
const processRoutes = Router();

// Rotas existentes
processRoutes.post('/generate',       processController.generate);
processRoutes.post('/extract-prompt', upload.single('file'),         processController.extractPrompt);
processRoutes.post('/generate-batch', upload.array('files', 10),     processController.generateBatch);

// Novas rotas de Process Mining
processRoutes.patch('/nodes/:nodeId/status',    processController.updateNodeStatus);
processRoutes.get('/nodes/:nodeId/timeline',    processController.getNodeTimeline);
processRoutes.post('/nodes/:nodeId/sla',        processController.initNodeSla);
processRoutes.get('/diagnostic/:processId',     processController.getProcessDiagnostic);

export { processRoutes };