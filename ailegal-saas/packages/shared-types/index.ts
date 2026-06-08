
export type NodeStatus = 'todo' | 'in_progress' | 'done' | 'blocked';

export type NodeType = 'task' | 'gateway' | 'start' | 'end' | 'swimlane';


export interface BpmnNodeData {
  label: string;
  actor?: string;
  status?: NodeStatus;
  sla?: SlaConfig;
  timeline?: TimelineEvent[];

  sourceFile?: string;
}

export interface BpmnNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: BpmnNodeData;
  zIndex?: number;
}

export interface BpmnEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
}


export interface FlowchartData {
  nodes: BpmnNode[];
  edges: BpmnEdge[];
}


export type QueueItemStatus =
  | 'waiting'
  | 'extracting'
  | 'generating'
  | 'done'
  | 'error';

export interface ProcessingQueueItem {
  id: string;
  fileName: string;
  status: QueueItemStatus;

  extractedPrompt?: string;

  errorMessage?: string;
}


export interface Project {
  id: string;
  name: string;
  type: 'Automático' | 'Criminal' | 'Trabalhista';
  
  status: 'idle' | 'extracting' | 'ready' | 'generating' | 'done' | 'error';
  nodes: BpmnNode[];

  edges: BpmnEdge[];
  aiLog: string[];

  promptText: string;
 
  processingQueue: ProcessingQueueItem[];
}


export interface SlaConfig {
  expectedMinutes: number;
  startedAt?: string;
  completedAt?: string;
  actualMinutes?: number;
  isViolated?: boolean;
  delayMinutes?: number;
}

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
  projectId: string;
  note?: string;
}


export interface MergeFlowDTO {
  existingGraph: FlowchartData;

  newDocumentText: string;
  
  sourceFileName: string;
}

export interface ProcessDiagnostic {
  processId: string;
  totalNodes: number;
  completedNodes: number;
  blockedNodes: number;
  slaViolations: Array<{
    nodeId: string;
    nodeLabel: string;
    delayMinutes: number;
    actor: string;
  }>;
  completionRate: number;
}