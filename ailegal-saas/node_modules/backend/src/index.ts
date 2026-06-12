import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { processRoutes }  from './modules/process/process.routes.js';
import { projectsRoutes }  from './modules/projects/projects.routes.js';
import { timelineRoutes } from './modules/timeline/timeline.routes.js';
import { testConnection } from './database/connection.js';
import { runMigrations }  from './database/migrations.js';

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // limit maior para o JSONB dos nodes

app.use('/api/process', processRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/timeline', timelineRoutes); 

async function bootstrap() {
  // Testa conexão e executa migrations antes de subir o servidor
  const dbOk = await testConnection();

  if (dbOk) {
    await runMigrations();
  } else {
    console.warn('[Servidor] Postgres indisponível — rodando sem banco de dados.');
  }

  app.listen(PORT, () => {
    console.log(` Servidor AILegal rodando na porta ${PORT}`);
  });
}

bootstrap();