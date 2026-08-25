import { generateText } from './ai.provider.js';
import { FlowchartData } from '@pbmapp/shared-types';

// ─── PROMPT BASE (geração de fluxo novo) ─────────────────────────────────────

const BPMN_SYSTEM_PROMPT = `You are a strict BPMN 2.0 Process Architect. Your ONLY job is to convert a process description into a valid React Flow JSON graph.

Return ONLY raw JSON. No markdown, no backticks, no explanation. The root object must contain exactly two keys: "nodes" and "edges". Every node position must be { "x": 0, "y": 0 } because layout is handled externally. Maximum 20 nodes per diagram — summarize if the process is longer.

NODE TYPES — use only these four: "start" (one per process, single entry point, no incoming edges), "end" (one or more, every path must terminate here), "task" (a human or system action, label must be a verb phrase of max 4 words), "gateway" (a decision point, label must be a short question of max 3 words). Never invent other node types.

Every node must have a "data" object with these required fields:
- "label": max 4 words, imperative verb or short question, never generic labels like "Process" or "Step 1"
- "actor": the swimlane owner — use consistent naming throughout the diagram
- "sourceFile": the name of the source document this node came from (will be provided in the prompt)

EDGE RULES: Every edge needs "id", "source" and "target". Gateway outgoing edges MUST have a "label" (ex: "Yes"/"No"). Task and start outgoing edges must NOT have a label. No orphan nodes. Edge IDs must follow the pattern "e{source}-{target}".

BPMN MODELING RULES: For loops, connect the gateway back to the EXISTING task node ID — never duplicate. For parallel paths, use a gateway with multiple labeled outgoing edges.

STRICTLY FORBIDDEN: gateway with only one outgoing edge; task with more than one outgoing edge; two nodes with the same id; edge whose source or target does not match any existing node id; start node with incoming edges; end node with outgoing edges; labels longer than 4 words.

Important: the "label" and "actor" values must be written in the same language as the process description provided by the user.

Now model the following process:`;

// ─── PROMPT DE MERGE (incorpora novo arquivo ao grafo existente) ──────────────

const BPMN_MERGE_SYSTEM_PROMPT = `You are a strict BPMN 2.0 Process Architect specializing in multi-process integration. Your job is to merge a new process document into an existing React Flow JSON graph.

Return ONLY raw JSON. No markdown, no backticks, no explanation. The root object must contain exactly two keys: "nodes" and "edges".

YOU WILL RECEIVE:
1. EXISTING_GRAPH: A valid JSON with the current nodes and edges already in the diagram
2. NEW_DOCUMENT_TEXT: The text of a new process document to be incorporated
3. SOURCE_FILE_NAME: The name of the new document

YOUR TASK — follow these rules in order:

RULE 1 — PRESERVE EVERYTHING:
All nodes and edges from EXISTING_GRAPH must appear in your output UNCHANGED.
Do NOT modify, rename, or remove any existing node or edge.
Do NOT change any existing node's "id", "label", "actor", or "data" properties.

RULE 2 — GENERATE NEW NODES:
Analyze NEW_DOCUMENT_TEXT and create new nodes for the new process.
Every new node MUST have:
- A unique "id" that does NOT conflict with any existing node id (prefix new ids with "new_" + timestamp-like suffix, e.g. "new_a1", "new_a2")
- "position": { "x": 0, "y": 0 }
- "data.sourceFile": set to SOURCE_FILE_NAME
- "data.label": max 4 words
- "data.actor": consistent actor name
- "data.status": "todo"

RULE 3 — DECIDE ON CONNECTIONS (most critical rule):
After generating the new nodes, analyze if there is a logical dependency between the new process and the existing process.

CASE A — PROCESSES ARE RELATED (there is a clear handoff, trigger, or dependency):
Create one or more "bridge edges" connecting an existing node to a new node (or vice versa).
Bridge edge id format: "bridge_{existing_node_id}_{new_node_id}"
Bridge edges MUST have a "label" explaining the connection (ex: "triggers", "depends on", "after approval").

CASE B — PROCESSES ARE INDEPENDENT (different departments, no shared trigger):
Do NOT create any bridge edges.
The new nodes will appear as an isolated parallel flow ("island") on the canvas.
The layout engine (Dagre) will handle positioning automatically.

RULE 4 — SCHEMA COMPLIANCE:
The final output must be a valid merged graph containing ALL existing nodes + ALL new nodes + ALL existing edges + bridge edges (if applicable).
Every node must have: id, type, position, data (with label, actor, sourceFile, status).
Every edge must have: id, source, target (and optionally label).

STRICTLY FORBIDDEN:
- Removing or modifying existing nodes or edges
- Using an existing node's id for a new node
- Creating a bridge edge without a label
- Leaving orphan nodes (every node must have at least one edge)
- Nodes with duplicate ids

Important: all "label" and "actor" values must be in the same language as the input documents.

Now perform the merge with the following data:`;

// ─── AI SERVICE ───────────────────────────────────────────────────────────────

export class AIService {

  // Gera fluxo base a partir de texto
  async generateFlowchartFromText(
    userPrompt: string,
    sourceFileName?: string
  ): Promise<FlowchartData> {
    const prompt = sourceFileName
      ? `Source document: "${sourceFileName}"\n\n${userPrompt}`
      : userPrompt;

    const response = await generateText({
      prompt,
      system: BPMN_SYSTEM_PROMPT,
      format: 'json',
    });

    return this.parseResponse(response);
  }

  // Merge de novo arquivo no grafo existente
  async mergeFlowchart(
    existingGraph: FlowchartData,
    newDocumentText: string,
    sourceFileName: string
  ): Promise<FlowchartData> {
    const prompt = `
EXISTING_GRAPH:
${JSON.stringify(existingGraph, null, 2)}

SOURCE_FILE_NAME: "${sourceFileName}"

NEW_DOCUMENT_TEXT:
"${newDocumentText.substring(0, 12000)}"
    `.trim();

    const response = await generateText({
      prompt,
      system: BPMN_MERGE_SYSTEM_PROMPT,
      format: 'json',
    });

    const merged = this.parseResponse(response);

    // Validação extra: garante que todos os nós originais foram preservados
    const originalIds = new Set(existingGraph.nodes.map(n => n.id));
    const mergedIds   = new Set(merged.nodes.map(n => n.id));

    const missingIds = [...originalIds].filter(id => !mergedIds.has(id));

    if (missingIds.length > 0) {
      console.warn(`[mergeFlowchart] IA removeu ${missingIds.length} nós existentes. Restaurando...`);
      // Restaura os nós perdidos
      const missingNodes = existingGraph.nodes.filter(n => missingIds.includes(n.id));
      merged.nodes = [...missingNodes, ...merged.nodes];

      // Restaura as edges dos nós perdidos
      const missingEdges = existingGraph.edges.filter(
        e => missingIds.includes(e.source) || missingIds.includes(e.target)
      );
      const mergedEdgeIds = new Set(merged.edges.map(e => e.id));
      const edgesToAdd = missingEdges.filter(e => !mergedEdgeIds.has(e.id));
      merged.edges = [...edgesToAdd, ...merged.edges];
    }

    return merged;
  }

  // Gera texto puro (sem schema JSON) — usado pelo extract-prompt
  async generateRawText(fullPrompt: string): Promise<string> {
    const response = await generateText({
      prompt: fullPrompt,
      system: '',
      format: 'text',
    });
    return response;
  }

  // Parser + validador do JSON retornado pela IA
  private parseResponse(raw: string): FlowchartData {
    try {
      const clean = raw
        .trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();

      const data = JSON.parse(clean) as FlowchartData;

      if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
        throw new Error('Missing nodes or edges array');
      }

      if (!data.nodes.some(n => n.type === 'start')) {
        throw new Error('No start node found');
      }

      if (!data.nodes.some(n => n.type === 'end')) {
        throw new Error('No end node found');
      }

      // Garante que todo nó tem sourceFile (fallback)
      data.nodes = data.nodes.map(n => ({
        ...n,
        data: {
          ...n.data,
          sourceFile: n.data?.sourceFile ?? 'unknown',
          status:     n.data?.status ?? 'todo',
          timeline:   n.data?.timeline ?? [],
        },
      }));

      return data;
    } catch (err) {
      throw new Error(`parseResponse failed: ${(err as Error).message}`);
    }
  }
}
