import { Router } from 'express';
import multer from 'multer';
import { processController } from './process.controller.js';

const upload = multer({ dest: 'uploads/' });

const processRoutes = Router();

processRoutes.post('/generate', processController.generate);

processRoutes.post('/extract-prompt', upload.single('file'), processController.extractPrompt);

processRoutes.post('/generate-batch', upload.array('files', 10), processController.generateBatch);

export { processRoutes };