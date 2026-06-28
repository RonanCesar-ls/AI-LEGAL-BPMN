import { pool } from './connection.js';

/**
 * Cria todas as tabelas se não existirem.
 * Executado automaticamente na inicialização do servidor.
 */
export async function runMigrations(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name       VARCHAR(255) NOT NULL,
        email      VARCHAR(255) UNIQUE NOT NULL,
        password   VARCHAR(255) NOT NULL,
        role       VARCHAR(50)  NOT NULL DEFAULT 'user',
        created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name             VARCHAR(255) NOT NULL,
        type             VARCHAR(50)  NOT NULL DEFAULT 'Automático',
        status           VARCHAR(50)  NOT NULL DEFAULT 'idle',
        prompt_text      TEXT,
        nodes            JSONB NOT NULL DEFAULT '[]',
        edges            JSONB NOT NULL DEFAULT '[]',
        processing_queue JSONB NOT NULL DEFAULT '[]',
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_user_id
      ON projects(user_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_nodes_gin
      ON projects USING gin(nodes);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS timeline_events (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        node_id     VARCHAR(255) NOT NULL,
        node_label  VARCHAR(255),
        actor       VARCHAR(255) NOT NULL,
        from_status VARCHAR(50),
        to_status   VARCHAR(50)  NOT NULL,
        note        TEXT,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_timeline_project_id
      ON timeline_events(project_id, created_at DESC);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_timeline_node_id
      ON timeline_events(node_id, project_id);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
        title       VARCHAR(255) NOT NULL,
        description TEXT,
        task_date   DATE NOT NULL,
        status      VARCHAR(50) NOT NULL DEFAULT 'todo',
        project_id  UUID REFERENCES projects(id) ON DELETE SET NULL,
        node_id     VARCHAR(255),
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_user_date
      ON tasks(user_id, task_date);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_date
      ON tasks(task_date);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_project_id
      ON tasks(project_id);
    `);

    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TRIGGER trigger_projects_updated_at
          BEFORE UPDATE ON projects
          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TRIGGER trigger_users_updated_at
          BEFORE UPDATE ON users
          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TRIGGER trigger_tasks_updated_at
          BEFORE UPDATE ON tasks
          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await client.query('COMMIT');
    console.log('[PostgreSQL] Migrations executadas com sucesso.');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[PostgreSQL] Erro nas migrations:', (err as Error).message);
    throw err;
  } finally {
    client.release();
  }
}