import { pool } from './connection.js';

export interface ProjectRow {
  id:               string;
  user_id:          string;
  name:             string;
  type:             string;
  status:           string;
  prompt_text:      string | null;
  nodes:            any[];
  edges:            any[];
  processing_queue: any[];
  created_at:       string;
  updated_at:       string;
}

export const projectRepository = {

  // Busca todos os projetos de um usuário
  async findByUserId(userId: string): Promise<ProjectRow[]> {
    const result = await pool.query<ProjectRow>(`
      SELECT id, user_id, name, type, status,
             prompt_text, nodes, edges, processing_queue,
             created_at, updated_at
      FROM projects
      WHERE user_id = $1
      ORDER BY updated_at DESC
    `, [userId]);
    return result.rows;
  },

  // Busca um projeto específico
  async findById(id: string, userId: string): Promise<ProjectRow | null> {
    const result = await pool.query<ProjectRow>(`
      SELECT id, user_id, name, type, status,
             prompt_text, nodes, edges, processing_queue,
             created_at, updated_at
      FROM projects
      WHERE id = $1 AND user_id = $2
    `, [id, userId]);
    return result.rows[0] ?? null;
  },

  // Cria um projeto novo
  async create(data: {
    userId:          string;
    name:            string;
    type?:           string;
    status?:         string;
    promptText?:     string;
    nodes?:          any[];
    edges?:          any[];
    processingQueue?: any[];
  }): Promise<ProjectRow> {
    const result = await pool.query<ProjectRow>(`
      INSERT INTO projects
        (user_id, name, type, status, prompt_text, nodes, edges, processing_queue)
      VALUES
        ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb)
      RETURNING *
    `, [
      data.userId,
      data.name,
      data.type            ?? 'Automático',
      data.status          ?? 'idle',
      data.promptText      ?? null,
      JSON.stringify(data.nodes            ?? []),
      JSON.stringify(data.edges            ?? []),
      JSON.stringify(data.processingQueue  ?? []),
    ]);
    return result.rows[0];
  },

  // Atualiza um projeto existente
  async update(id: string, userId: string, data: {
    name?:            string;
    type?:            string;
    status?:          string;
    promptText?:      string;
    nodes?:           any[];
    edges?:           any[];
    processingQueue?: any[];
  }): Promise<ProjectRow | null> {
    // Monta o SET dinamicamente para atualizar só os campos enviados
    const fields: string[] = [];
    const values: any[]    = [];
    let   idx              = 1;

    if (data.name            !== undefined) { fields.push(`name = $${idx++}`);             values.push(data.name); }
    if (data.type            !== undefined) { fields.push(`type = $${idx++}`);             values.push(data.type); }
    if (data.status          !== undefined) { fields.push(`status = $${idx++}`);           values.push(data.status); }
    if (data.promptText      !== undefined) { fields.push(`prompt_text = $${idx++}`);      values.push(data.promptText); }
    if (data.nodes           !== undefined) { fields.push(`nodes = $${idx++}::jsonb`);     values.push(JSON.stringify(data.nodes)); }
    if (data.edges           !== undefined) { fields.push(`edges = $${idx++}::jsonb`);     values.push(JSON.stringify(data.edges)); }
    if (data.processingQueue !== undefined) { fields.push(`processing_queue = $${idx++}::jsonb`); values.push(JSON.stringify(data.processingQueue)); }

    if (fields.length === 0) return null;

    values.push(id, userId);

    const result = await pool.query<ProjectRow>(`
      UPDATE projects
      SET ${fields.join(', ')}
      WHERE id = $${idx++} AND user_id = $${idx++}
      RETURNING *
    `, values);

    return result.rows[0] ?? null;
  },

  // Deleta um projeto
  async delete(id: string, userId: string): Promise<boolean> {
    const result = await pool.query(`
      DELETE FROM projects
      WHERE id = $1 AND user_id = $2
    `, [id, userId]);
    return (result.rowCount ?? 0) > 0;
  },
};