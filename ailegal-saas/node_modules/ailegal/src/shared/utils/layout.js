// src/shared/utils/layout.js
import dagre from "dagre";

export const getLayoutedElements = (nodes, edges) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 80, ranksep: 200 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 160, height: 60 });
  });
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
  dagre.layout(dagreGraph);

  const uniqueActors = [...new Set(nodes.map(n => n.data?.actor || 'Sistema'))];

  const columnBuckets = {};
  nodes.forEach((node) => {
    const pos = dagreGraph.node(node.id);
    const actor = node.data?.actor || 'Sistema';
    const col = Math.round(pos.x / 50); 
    const key = `${actor}__${col}`;
    if (!columnBuckets[key]) columnBuckets[key] = [];
    columnBuckets[key].push(node.id);
  });

  const maxStack = Math.max(1, ...Object.values(columnBuckets).map(b => b.length));
  const NODE_H = 80;
  const LANE_PADDING = 60;
  const swimlaneHeight = Math.max(200, maxStack * NODE_H + LANE_PADDING * 2);

  const placedCount = {};
  const layoutedNodes = nodes.map((node) => {
    const pos = dagreGraph.node(node.id);
    const actor = node.data?.actor || 'Sistema';
    const actorIndex = uniqueActors.indexOf(actor);
    const col = Math.round(pos.x / 50);
    const key = `${actor}__${col}`;
    const bucket = columnBuckets[key];
    const totalInBucket = bucket.length;

    if (!placedCount[key]) placedCount[key] = 0;
    const indexInBucket = placedCount[key]++;

    const groupHeight = totalInBucket * NODE_H;
    const groupStartY = (swimlaneHeight - groupHeight) / 2;
    const nodeY = groupStartY + indexInBucket * NODE_H;

    return {
      ...node,
      position: { x: pos.x + 80, y: actorIndex * swimlaneHeight + nodeY },
      zIndex: 10,
    };
  });

  const allX = nodes.map(n => dagreGraph.node(n.id).x);
  const swimlaneWidth = Math.max(1400, Math.max(...allX) + 600);

  const swimlaneNodes = uniqueActors.map((actor, i) => ({
    id: `swimlane-${i}`,
    type: 'swimlane',
    position: { x: 0, y: i * swimlaneHeight },
    data: { label: actor, width: swimlaneWidth, height: swimlaneHeight, odd: i % 2 !== 0 },
    draggable: false, selectable: false, zIndex: -1,
  }));

  const layoutedEdges = edges.map(e => ({
    id: e.id || `e${e.source}-${e.target}`,
    source: e.source, target: e.target,
    label: e.label || "",
    type: 'smoothstep',
    markerEnd: { type: 'arrowclosed', color: "#64748b" },
    style: { stroke: "#64748b", strokeWidth: 2 },
    labelStyle: { fill: "#b45309", fontWeight: 700, fontSize: 11 },
    labelBgStyle: { fill: "#ffffff" },
  }));

  return { nodes: [...swimlaneNodes, ...layoutedNodes], edges: layoutedEdges };
};