import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { processRoutes }  from './modules/process/process.routes.js';
import { projectsRoutes }  from './modules/projects/projects.routes.js';
import { timelineRoutes } from './modules/timeline/timeline.routes.js';
import { authRoutes }     from './modules/auth/auth.routes.js'; 
import { testConnection } from './database/connection.js';
import { runMigrations }  from './database/migrations.js';
import { authMiddleware } from './middleware/auth.middleware.js';

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'http://app.177.104.179.163.nip.io',
    'http://localhost:5173',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' })); // limit maior para o JSONB dos nodes

// ─── ROTAS PÚBLICAS ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ─── ROTAS PROTEGIDAS ────────────────────────────────────────────
// O authMiddleware vem ANTES do roteador para garantir a injeção do req.user
app.use('/api/projects', authMiddleware, projectsRoutes);
app.use('/api/timeline', authMiddleware, timelineRoutes);
app.use('/api/process',  authMiddleware, processRoutes);


async function bootstrap() {
  // Testa conexão e executa migrations antes de subir o servidor
  const dbOk = await testConnection();

  if (dbOk) {
    await runMigrations();
  } else {
    console.warn('[Servidor] Postgres indisponível — rodando sem banco de dados.');
  }

  app.listen(PORT, () => {
    console.log(`Servidor AILegal rodando na porta ${PORT}`);
  });
}

bootstrap();