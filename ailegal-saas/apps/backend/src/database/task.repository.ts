import { pool } from './connection.js';

export interface TaskRow {
  id:          string;
  user_id:     string;
  created_by:  string | null;
  title:       string;
  description: string | null;
  task_date:   string;
  status:      string;
  project_id:  string | null;
  node_id:     string | null;
  created_at:  string;
  updated_at:  string;
}

export const taskRepository = {

  async findByUserAndDateRange(
    userId: string,
    dateFrom: string,
    dateTo: string
  ): Promise<TaskRow[]> {
    const result = await pool.query<TaskRow>(`
      SELECT * FROM tasks
      WHERE user_id = $1
        AND task_date BETWEEN $2 AND $3
      ORDER BY task_date ASC, created_at ASC
    `, [userId, dateFrom, dateTo]);
    return result.rows;
  },

  async findById(id: string): Promise<TaskRow | null> {
    const result = await pool.query<TaskRow>(`
      SELECT * FROM tasks WHERE id = $1
    `, [id]);
    return result.rows[0] ?? null;
  },

  async create(data: {
    userId:      string;
    createdBy?:  string;
    title:       string;
    description?: string;
    taskDate:    string;
    status?:     string;
    projectId?:  string;
    nodeId?:     string;
  }): Promise<TaskRow> {
    const result = await pool.query<TaskRow>(`
      INSERT INTO tasks
        (user_id, created_by, title, description, task_date, status, project_id, node_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      data.userId,
      data.createdBy ?? data.userId,
      data.title,
      data.description ?? null,
      data.taskDate,
      data.status ?? 'todo',
      data.projectId ?? null,
      data.nodeId ?? null,
    ]);
    return result.rows[0];
  },

  async update(id: string, userId: string, data: {
    title?:       string;
    description?: string;
    taskDate?:    string;
    status?:      string;
  }): Promise<TaskRow | null> {
    const fields: string[] = [];
    const values: any[]    = [];
    let   idx               = 1;

    if (data.title       !== undefined) { fields.push(`title = $${idx++}`);       values.push(data.title); }
    if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description); }
    if (data.taskDate    !== undefined) { fields.push(`task_date = $${idx++}`);   values.push(data.taskDate); }
    if (data.status      !== undefined) { fields.push(`status = $${idx++}`);      values.push(data.status); }

    if (fields.length === 0) return null;

    values.push(id, userId);

    const result = await pool.query<TaskRow>(`
      UPDATE tasks
      SET ${fields.join(', ')}
      WHERE id = $${idx++} AND user_id = $${idx++}
      RETURNING *
    `, values);

    return result.rows[0] ?? null;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await pool.query(`
      DELETE FROM tasks WHERE id = $1 AND user_id = $2
    `, [id, userId]);
    return (result.rowCount ?? 0) > 0;
  },

  async reallocateMany(taskIds: string[], userId: string, newDate: string): Promise<number> {
    const result = await pool.query(`
      UPDATE tasks
      SET task_date = $1
      WHERE id = ANY($2::uuid[]) AND user_id = $3
    `, [newDate, taskIds, userId]);
    return result.rowCount ?? 0;
  },

  async getCompletionAverage(userId: string, daysBack: number = 30): Promise<number> {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'done')::float /
        GREATEST(COUNT(DISTINCT task_date), 1) AS avg_per_day
      FROM tasks
      WHERE user_id = $1
        AND task_date >= CURRENT_DATE - $2::int
    `, [userId, daysBack]);
    return parseFloat(result.rows[0]?.avg_per_day ?? '0');
  },

  async existsForNodeAndDate(projectId: string, nodeId: string, taskDate: string): Promise<boolean> {
    const result = await pool.query(`
      SELECT id FROM tasks
      WHERE project_id = $1 AND node_id = $2 AND task_date = $3
      LIMIT 1
    `, [projectId, nodeId, taskDate]);
    return result.rows.length > 0;
  },

  async findUserByName(name: string): Promise<{ id: string; name: string } | null> {
    const result = await pool.query(`
      SELECT id, name FROM users WHERE LOWER(name) = LOWER($1) LIMIT 1
    `, [name]);
    return result.rows[0] ?? null;
  },
};


export interface TaskAuditRow {
  id:             string;
  task_id:        string | null;
  project_id:     string | null;
  actor_id:       string;
  actor_name:     string;
  acting_as_id:   string | null;
  acting_as_name: string | null;
  action:         string;
  from_status:    string | null;
  to_status:      string | null;
  task_title:     string | null;
  note:           string | null;
  created_at:     string;
}

export const taskAuditRepository = {

  async create(data: {
    taskId?:        string;
    projectId?:     string;
    actorId:        string;
    actorName:      string;
    actingAsId?:    string;
    actingAsName?:  string;
    action:         string;
    fromStatus?:    string;
    toStatus?:      string;
    taskTitle?:     string;
    note?:          string;
  }): Promise<TaskAuditRow> {
    const result = await pool.query<TaskAuditRow>(`
      INSERT INTO task_audit_log
        (task_id, project_id, actor_id, actor_name, acting_as_id, acting_as_name,
         action, from_status, to_status, task_title, note)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      data.taskId         ?? null,
      data.projectId      ?? null,
      data.actorId,
      data.actorName,
      data.actingAsId     ?? null,
      data.actingAsName   ?? null,
      data.action,
      data.fromStatus     ?? null,
      data.toStatus       ?? null,
      data.taskTitle      ?? null,
      data.note           ?? null,
    ]);
    return result.rows[0];
  },

  async findByUser(userId: string, limit = 50): Promise<TaskAuditRow[]> {
    const result = await pool.query<TaskAuditRow>(`
      SELECT * FROM task_audit_log
      WHERE actor_id = $1 OR acting_as_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [userId, limit]);
    return result.rows;
  },

  async findByTask(taskId: string): Promise<TaskAuditRow[]> {
    const result = await pool.query<TaskAuditRow>(`
      SELECT * FROM task_audit_log
      WHERE task_id = $1
      ORDER BY created_at DESC
    `, [taskId]);
    return result.rows;
  },
};