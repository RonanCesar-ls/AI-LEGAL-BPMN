import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { processRoutes } from './modules/process/process.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/process', processRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor AILegal rodando na porta ${PORT}`);
});