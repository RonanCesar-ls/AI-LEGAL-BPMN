import { randomUUID } from 'crypto';

export type NodeStatus = 'todo' | 'in_progress' | 'done' | 'blocked';

export interface TimelineEvent {
  id: string;
  nodeId: string;
  projectId: string;
  actor: string;
  fromStatus: NodeStatus | null;
  toStatus: NodeStatus;
  timestamp: string;
  note?: string;
}

export interface UpdateNodeStatusDTO {
  status: NodeStatus;
  actor: string;
  note?: string;
}

class TimelineService {
  // Chave: projectId:nodeId → lista de eventos
  private memStore = new Map<string, TimelineEvent[]>();

  private key(projectId: string, nodeId: string) {
    return `${projectId}:${nodeId}`;
  }

  async recordChange(
    projectId: string,
    nodeId: string,
    fromStatus: NodeStatus | null,
    dto: UpdateNodeStatusDTO
  ): Promise<TimelineEvent> {
    const event: TimelineEvent = {
      id:         randomUUID(),
      nodeId,
      projectId,
      actor:      dto.actor,
      fromStatus,
      toStatus:   dto.status,
      timestamp:  new Date().toISOString(),
      note:       dto.note,
    };

    const k        = this.key(projectId, nodeId);
    const existing = this.memStore.get(k) ?? [];
    this.memStore.set(k, [...existing, event]);

    return event;
  }

  async getTimeline(projectId: string, nodeId: string): Promise<TimelineEvent[]> {
    const k = this.key(projectId, nodeId);
    return [...(this.memStore.get(k) ?? [])].reverse();
  }

  async getCurrentStatus(projectId: string, nodeId: string): Promise<NodeStatus | null> {
    const k      = this.key(projectId, nodeId);
    const events = this.memStore.get(k) ?? [];
    return events.length > 0 ? events[events.length - 1].toStatus : null;
  }
}

export const timelineService = new TimelineService();