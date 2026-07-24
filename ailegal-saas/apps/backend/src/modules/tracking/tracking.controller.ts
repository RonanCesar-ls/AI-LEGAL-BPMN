import { Request, Response } from 'express';
import { trackingRepository } from '../../database/tracking.repository.js';
import { notifyDashboardUpdate } from '../tasks/tasks.controller.js';

const DOMAIN_MAP: Record<string, string> = {
  'web.whatsapp.com':       'whatsapp',
  'mail.google.com':        'email',
  'outlook.office.com':     'email',
  'outlook.live.com':       'email',
  'instagram.com':          'instagram',
  'www.instagram.com':      'instagram',
  'facebook.com':           'facebook',
  'www.facebook.com':       'facebook',
  'twitter.com':            'twitter',
  'x.com':                  'twitter',
  'linkedin.com':           'linkedin',
  'www.linkedin.com':       'linkedin',
  'youtube.com':            'youtube',
  'www.youtube.com':        'youtube',
};

function normalizeDomain(raw: string): string {
  return DOMAIN_MAP[raw] ?? raw;
}

export const trackingController = {

  track: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user?.userId) return res.status(401).json({ error: 'Não autorizado.' });

      const enabled = await trackingRepository.getMonitoringStatus();
      if (!enabled) {
        return res.json({ ok: false, reason: 'Monitoramento desativado pelo administrador.' });
      }

      const { domain, durationSeconds, date } = req.body;

      if (!domain || !durationSeconds || durationSeconds <= 0) {
        return res.status(400).json({ error: 'domain e durationSeconds são obrigatórios.' });
      }

      const today = new Date();
      const todayLocal = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
      const trackingDate = date ?? todayLocal;

      const normalized = normalizeDomain(domain);
      const record     = await trackingRepository.upsert(user.userId, normalized, durationSeconds, trackingDate);

      notifyDashboardUpdate();

      return res.json({ ok: true, record });
    } catch (err) {
      console.error('[tracking.track]', err);
      return res.status(500).json({ error: 'Falha ao registrar tempo.' });
    }
  },

  getByUser: async (req: Request, res: Response) => {
    try {
      const loggedUser = (req as any).user;
      const { from, to, userId } = req.query as { from?: string; to?: string; userId?: string };

      const today = new Date();
      const todayLocal = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

      const targetUserId = userId ?? loggedUser.userId;
      const dateFrom     = from ?? todayLocal;
      const dateTo       = to   ?? todayLocal;

      const [raw, aggregated] = await Promise.all([
        trackingRepository.findByUserAndDateRange(targetUserId, dateFrom, dateTo),
        trackingRepository.aggregateByDomain(targetUserId, dateFrom, dateTo),
      ]);

      return res.json({
        records:    raw,
        aggregated,
      });
    } catch (err) {
      console.error('[tracking.getByUser]', err);
      return res.status(500).json({ error: 'Falha ao buscar dados.' });
    }
  },

  getTeam: async (req: Request, res: Response) => {
    try {
      const { date } = req.query as { date?: string };
      const today = new Date();
      const todayLocal = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

      const records = await trackingRepository.findByDate(date ?? todayLocal);
      return res.json(records);
    } catch (err) {
      console.error('[tracking.getTeam]', err);
      return res.status(500).json({ error: 'Falha ao buscar dados da equipe.' });
    }
  },

  getStatus: async (_req: Request, res: Response) => {
    try {
      const enabled = await trackingRepository.getMonitoringStatus();
      return res.json({ enabled });
    } catch (err) {
      return res.status(500).json({ error: 'Falha ao buscar status.' });
    }
  },

  setStatus: async (req: Request, res: Response) => {
    try {
      const { enabled } = req.body;
      if (typeof enabled !== 'boolean') {
        return res.status(400).json({ error: 'enabled deve ser boolean.' });
      }
      await trackingRepository.setMonitoringStatus(enabled);
      notifyDashboardUpdate();
      return res.json({ ok: true, enabled });
    } catch (err) {
      return res.status(500).json({ error: 'Falha ao atualizar status.' });
    }
  },
};