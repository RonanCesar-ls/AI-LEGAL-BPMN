import { Router } from 'express';
import multer from 'multer'; // <-- Importando o multer
import { processController } from './process.controller.js';

// Configuração do multer para salvar temporariamente na pasta 'uploads/'
const upload = multer({ dest: 'uploads/' });

const processRoutes = Router();

// Rota que você já tinha:
processRoutes.post('/generate', processController.generate);

// NOVA ROTA: Passamos pelo middleware do multer primeiro, depois pro controlador
processRoutes.post('/extract-prompt', upload.single('file'), processController.extractPrompt);

processRoutes.post('/generate-batch', upload.array('files', 10), processController.generateBatch);

export { processRoutes };