import { pool } from './connection.js';

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

    // Adiciona coluna acting_as em timeline_events (quem estava atuando como quem)
    await client.query(`
      ALTER TABLE timeline_events
      ADD COLUMN IF NOT EXISTS acting_as VARCHAR(255);
    `);

    // Tabela de auditoria de tarefas do diário de bordo
    await client.query(`
      CREATE TABLE IF NOT EXISTS task_audit_log (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id       UUID REFERENCES tasks(id) ON DELETE CASCADE,
        project_id    UUID REFERENCES projects(id) ON DELETE SET NULL,
        actor_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        actor_name    VARCHAR(255) NOT NULL,
        acting_as_id  UUID REFERENCES users(id) ON DELETE SET NULL,
        acting_as_name VARCHAR(255),
        action        VARCHAR(50) NOT NULL,
        from_status   VARCHAR(50),
        to_status     VARCHAR(50),
        task_title    VARCHAR(255),
        note          TEXT,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    // ── USER TIME TRACKING (Monitoramento de produtividade) ──────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_time_tracking (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        domain           VARCHAR(100) NOT NULL,
        duration_seconds INT NOT NULL DEFAULT 0,
        tracking_date    DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, domain, tracking_date)
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tracking_user_date
      ON user_time_tracking(user_id, tracking_date DESC);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tracking_date
      ON user_time_tracking(tracking_date DESC);
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TRIGGER trigger_tracking_updated_at
          BEFORE UPDATE ON user_time_tracking
          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // ── APP SETTINGS (configurações globais) ─────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key        VARCHAR(100) PRIMARY KEY,
        value      TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Toggle de monitoramento começa ativado por padrão
    await client.query(`
      INSERT INTO app_settings (key, value)
      VALUES ('monitoring_enabled', 'true')
      ON CONFLICT (key) DO NOTHING;
    `);

     

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_task_audit_actor
      ON task_audit_log(actor_id, created_at DESC);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_task_audit_acting_as
      ON task_audit_log(acting_as_id, created_at DESC);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_task_audit_task_id
      ON task_audit_log(task_id);
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