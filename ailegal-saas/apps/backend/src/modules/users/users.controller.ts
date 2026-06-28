import { Request, Response } from 'express';
import { pool } from '../../database/connection.js';

export const usersController = {
  list: async (req: Request, res: Response) => {
    try {
      const result = await pool.query(
        'SELECT id, name, email, role FROM users ORDER BY name ASC'
      );
      return res.json(result.rows);
    } catch (err) {
      console.error('[users.list]', err);
      return res.status(500).json({ error: 'Falha ao buscar colaboradores.' });
    }
  },
};