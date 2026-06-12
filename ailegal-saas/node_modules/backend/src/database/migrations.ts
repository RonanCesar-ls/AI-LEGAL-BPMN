import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

// 1. Criando a piscina de conexões com o Postgres
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 2. A função de teste que o seu index.ts estava procurando
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    client.release();
    console.log('✅ [Banco de Dados] Conexão estabelecida com sucesso!');
    return true;
  } catch (error: any) {
    console.error('❌ [Banco de Dados] Erro ao conectar:', error.message);
    return false;
  }
};

// 3. O seu script Sênior de criação das tabelas
export async function runMigrations(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ── USERS ──────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name      VARCHAR(255) NOT NULL,
        email     VARCHAR(255) UNIQUE NOT NULL,
        password  VARCHAR(255) NOT NULL,
        role      VARCHAR(50)  NOT NULL DEFAULT 'user',
        created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    // ── PROJECTS ───────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name             VARCHAR(255) NOT NULL,
        type             VARCHAR(50)  NOT NULL DEFAULT 'Automático',
        status           VARCHAR(50)  NOT NULL DEFAULT 'idle',
        prompt_text      TEXT,
        -- React Flow nodes e edges salvos direto como JSONB
        nodes            JSONB NOT NULL DEFAULT '[]',
        edges            JSONB NOT NULL DEFAULT '[]',
        -- Fila de arquivos processados
        processing_queue JSONB NOT NULL DEFAULT '[]',
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Índice para buscar projetos por usuário rapidamente
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_user_id
      ON projects(user_id);
    `);

    // Índice GIN no JSONB para buscas dentro dos nodes (ex: por actor, status)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_nodes_gin
      ON projects USING gin(nodes);
    `);

    // ── TIMELINE EVENTS (Diário de Bordo) ──────────────────────────────────
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

    // Índice para buscar eventos por projeto (para o diário de bordo)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_timeline_project_id
      ON timeline_events(project_id, created_at DESC);
    `);

    // Índice para buscar eventos por nó específico
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_timeline_node_id
      ON timeline_events(node_id, project_id);
    `);

    // ── TRIGGER: atualiza updated_at automaticamente ───────────────────────
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

    await client.query('COMMIT');
    console.log('✅ [PostgreSQL] Migrations executadas com sucesso. Suas tabelas estão prontas!');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ [PostgreSQL] Erro nas migrations:', (err as Error).message);
    throw err;
  } finally {
    client.release();
  }
}