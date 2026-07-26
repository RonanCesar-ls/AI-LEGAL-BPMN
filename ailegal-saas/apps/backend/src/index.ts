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
import { tasksRoutes }    from './modules/tasks/tasks.routes.js';
import { tasksController } from './modules/tasks/tasks.controller.js';
import { usersRoutes }    from './modules/users/users.routes.js';
import { trackingRoutes } from './modules/tracking/tracking.routes.js';

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'http://app.177.104.179.163.nip.io',
    'http://localhost:5173',
    'chrome-extension://flbbhdbclkjiaakniodphgkcebmdednp',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));

app.use('/api/auth',     authRoutes);
app.use('/api/tracking', authMiddleware, trackingRoutes);
app.use('/api/projects', authMiddleware, projectsRoutes);
app.use('/api/timeline', authMiddleware, timelineRoutes);
app.use('/api/process',  authMiddleware, processRoutes);

// EventSource não suporta header Authorization — token vem via query param
app.get('/api/tasks/events', tasksController.sseEvents);
app.use('/api/tasks',  authMiddleware, tasksRoutes);
app.use('/api/users',  authMiddleware, usersRoutes);

async function bootstrap() {
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