import { pool } from './connection.js';

export interface TrackingRow {
  id:               string;
  user_id:          string;
  domain:           string;
  duration_seconds: number;
  tracking_date:    string;
  created_at:       string;
  updated_at:       string;
}

export const trackingRepository = {

  async upsert(userId: string, domain: string, seconds: number, date: string): Promise<TrackingRow> {
    const result = await pool.query<TrackingRow>(`
      INSERT INTO user_time_tracking (user_id, domain, duration_seconds, tracking_date)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, domain, tracking_date)
      DO UPDATE SET
        duration_seconds = user_time_tracking.duration_seconds + EXCLUDED.duration_seconds,
        updated_at       = NOW()
      RETURNING *
    `, [userId, domain, seconds, date]);
    return result.rows[0];
  },

  async findByUserAndDateRange(userId: string, dateFrom: string, dateTo: string): Promise<TrackingRow[]> {
    const result = await pool.query<TrackingRow>(`
      SELECT * FROM user_time_tracking
      WHERE user_id = $1
        AND tracking_date BETWEEN $2 AND $3
      ORDER BY tracking_date DESC, duration_seconds DESC
    `, [userId, dateFrom, dateTo]);
    return result.rows;
  },

  async findByDate(date: string): Promise<Array<TrackingRow & { user_name: string }>> {
    const result = await pool.query(`
      SELECT t.*, u.name as user_name
      FROM user_time_tracking t
      JOIN users u ON u.id = t.user_id
      WHERE t.tracking_date = $1
      ORDER BY t.duration_seconds DESC
    `, [date]);
    return result.rows;
  },

  async aggregateByDomain(userId: string, dateFrom: string, dateTo: string): Promise<Array<{ domain: string; total_seconds: number }>> {
    const result = await pool.query(`
      SELECT domain, SUM(duration_seconds)::int AS total_seconds
      FROM user_time_tracking
      WHERE user_id = $1
        AND tracking_date BETWEEN $2 AND $3
      GROUP BY domain
      ORDER BY total_seconds DESC
    `, [userId, dateFrom, dateTo]);
    return result.rows;
  },

  async getMonitoringStatus(): Promise<boolean> {
    const result = await pool.query(`
      SELECT value FROM app_settings WHERE key = 'monitoring_enabled'
    `);
    return result.rows[0]?.value === 'true';
  },

  async setMonitoringStatus(enabled: boolean): Promise<void> {
    await pool.query(`
      INSERT INTO app_settings (key, value)
      VALUES ('monitoring_enabled', $1)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `, [String(enabled)]);
  },
};