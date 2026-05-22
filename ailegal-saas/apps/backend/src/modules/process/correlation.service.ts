export interface Correlation {
  actor: string;
  foundIn: string[];
}

export class CorrelationService {
  findSharedActors(flows: { id: string; nodes: any[] }[]): Correlation[] {
    const actorMap: Record<string, string[]> = {};

    flows.forEach(flow => {
      const actors = [
        ...new Set(
          flow.nodes
            .map(n => n.data?.actor)
            .filter(Boolean)
        )
      ];
      actors.forEach(actor => {
        if (!actorMap[actor]) actorMap[actor] = [];
        actorMap[actor].push(flow.id);
      });
    });

    return Object.entries(actorMap)
      .filter(([_, foundIn]) => foundIn.length > 1)
      .map(([actor, foundIn]) => ({ actor, foundIn }));
  }
}