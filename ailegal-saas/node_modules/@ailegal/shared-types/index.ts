export interface FlowchartNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: { label: string; [key: string]: any };
}

export interface FlowchartEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface FlowchartData {
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
}