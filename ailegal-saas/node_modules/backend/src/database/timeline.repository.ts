import { pool } from './connection.js';

export interface TimelineEventRow {
  id:          string;
  project_id:  string;
  node_id:     string;
  node_label:  string | null;
  actor:       string;
  from_status: string | null;
  to_status:   string;
  note:        string | null;
  created_at:  string;
}

export const timelineRepository = {

  // Registra um novo evento no diário de bordo
  async create(data: {
    projectId:  string;
    nodeId:     string;
    nodeLabel?: string;
    actor:      string;
    fromStatus?: string | null;
    toStatus:   string;
    note?:      string;
  }): Promise<TimelineEventRow> {
    const result = await pool.query<TimelineEventRow>(`
      INSERT INTO timeline_events
        (project_id, node_id, node_label, actor, from_status, to_status, note)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      data.projectId,
      data.nodeId,
      data.nodeLabel  ?? null,
      data.actor,
      data.fromStatus ?? null,
      data.toStatus,
      data.note       ?? null,
    ]);
    return result.rows[0];
  },

  // Busca todo o diário de bordo de um projeto
  async findByProjectId(projectId: string): Promise<TimelineEventRow[]> {
    const result = await pool.query<TimelineEventRow>(`
      SELECT * FROM timeline_events
      WHERE project_id = $1
      ORDER BY created_at ASC
    `, [projectId]);
    return result.rows;
  },

  // Busca eventos de um nó específico dentro de um projeto
  async findByNodeId(projectId: string, nodeId: string): Promise<TimelineEventRow[]> {
    const result = await pool.query<TimelineEventRow>(`
      SELECT * FROM timeline_events
      WHERE project_id = $1 AND node_id = $2
      ORDER BY created_at ASC
    `, [projectId, nodeId]);
    return result.rows;
  },

  // Resumo de gargalos: nós com mais impedimentos no projeto
  async getBottlenecks(projectId: string): Promise<Array<{
    node_id:    string;
    node_label: string | null;
    blocks:     number;
  }>> {
    const result = await pool.query(`
      SELECT
        node_id,
        node_label,
        COUNT(*) AS blocks
      FROM timeline_events
      WHERE project_id = $1
        AND to_status = 'blocked'
      GROUP BY node_id, node_label
      ORDER BY blocks DESC
      LIMIT 10
    `, [projectId]);
    return result.rows;
  },
};