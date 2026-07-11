import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../../database/connection.js';

const JWT_SECRET      = process.env.JWT_SECRET ?? 'ailegal_secret_dev';
const JWT_EXPIRES_IN  = '7d';
const SALT_ROUNDS     = 10;

export const authController = {

  register: async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
      }

      const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase().trim()]
      );

      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const result = await pool.query(`
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, 'user')
        RETURNING id, name, email, role, created_at
      `, [
        name.trim(),
        email.toLowerCase().trim(),
        hashedPassword,
      ]);

      const user = result.rows[0];

      const token = jwt.sign(
        { userId: user.id, name: user.name, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.status(201).json({
        token,
        user: {
          id:    user.id,
          name:  user.name,
          email: user.email,
          role:  user.role,
        },
      });

    } catch (err) {
      console.error('[auth.register]', err);
      return res.status(500).json({ error: 'Falha ao criar conta.' });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
      }

      const result = await pool.query(
        'SELECT id, name, email, password, role FROM users WHERE email = $1',
        [email.toLowerCase().trim()]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
      }

      const user = result.rows[0];

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
      }

      const token = jwt.sign(
        { userId: user.id, name: user.name, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        token,
        user: {
          id:    user.id,
          name:  user.name,
          email: user.email,
          role:  user.role,
        },
      });

    } catch (err) {
      console.error('[auth.login]', err);
      return res.status(500).json({ error: 'Falha ao fazer login.' });
    }
  },

  me: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      if (!user?.userId) {
        return res.status(401).json({ error: 'Não autorizado.' });
      }

      const result = await pool.query(
        'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
        [user.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      return res.json(result.rows[0]);
    } catch (err) {
      console.error('[auth.me]', err);
      return res.status(500).json({ error: 'Falha ao buscar usuário.' });
    }
  },
  verifyCollaborator: async (req: Request, res: Response) => {
    try {
      const requestingUser = (req as any).user;

      const { targetUserId, password } = req.body;

      if (!targetUserId || !password) {
        return res.status(400).json({ error: 'targetUserId e password são obrigatórios.' });
      }

      if (targetUserId === requestingUser.userId) {
        return res.json({ ok: true, isSelf: true });
      }

      const result = await pool.query(
        'SELECT id, name, email, password, role FROM users WHERE id = $1',
        [targetUserId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Colaborador não encontrado.' });
      }

      const collaborator = result.rows[0];

      const passwordMatch = await bcrypt.compare(password, collaborator.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Senha incorreta.' });
      }

      return res.json({
        ok:   true,
        isSelf: false,
        collaborator: {
          id:    collaborator.id,
          name:  collaborator.name,
          email: collaborator.email,
          role:  collaborator.role,
        },
      });

    } catch (err) {
      console.error('[auth.verifyCollaborator]', err);
      return res.status(500).json({ error: 'Falha ao verificar colaborador.' });
    }
  },
};