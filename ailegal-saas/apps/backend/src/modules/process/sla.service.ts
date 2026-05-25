export interface SlaConfig {
  expectedMinutes: number;
  startedAt?: string;
  completedAt?: string;
  actualMinutes?: number;
  isViolated?: boolean;
  delayMinutes?: number;
}

export type NodeStatus = 'todo' | 'in_progress' | 'done' | 'blocked';

class SlaService {
  // Chave: projectId:nodeId
  private store = new Map<string, SlaConfig>();

  private key(projectId: string, nodeId: string) {
    return `${projectId}:${nodeId}`;
  }

  initSla(projectId: string, nodeId: string, expectedMinutes: number): SlaConfig {
    const config: SlaConfig = { expectedMinutes };
    this.store.set(this.key(projectId, nodeId), config);
    return config;
  }

  onStatusChange(projectId: string, nodeId: string, newStatus: NodeStatus): SlaConfig | null {
    const k      = this.key(projectId, nodeId);
    const config = this.store.get(k);
    if (!config) return null;

    const now = new Date().toISOString();

    if (newStatus === 'in_progress' && !config.startedAt) {
      config.startedAt = now;
    }

    if (config.startedAt && (newStatus === 'done' || newStatus === 'in_progress')) {
      config.actualMinutes = this.diffMinutes(config.startedAt, now);
      config.delayMinutes  = config.actualMinutes - config.expectedMinutes;
      config.isViolated    = config.delayMinutes > 0;
      if (newStatus === 'done') config.completedAt = now;
    }

    this.store.set(k, config);
    return config;
  }

  getSla(projectId: string, nodeId: string): SlaConfig | null {
    return this.store.get(this.key(projectId, nodeId)) ?? null;
  }

  getViolations(projectId: string) {
    const result: Array<{ nodeId: string; delayMinutes: number }> = [];
    this.store.forEach((config, key) => {
      if (key.startsWith(`${projectId}:`) && config.isViolated && config.delayMinutes) {
        result.push({ nodeId: key.split(':')[1], delayMinutes: config.delayMinutes });
      }
    });
    return result.sort((a, b) => b.delayMinutes - a.delayMinutes);
  }

  private diffMinutes(from: string, to: string): number {
    return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 60000);
  }
}

export const slaService = new SlaService();