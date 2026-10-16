import { useCallback, useRef, useState } from 'react';
import { getLayoutedElements } from '../../../shared/utils/layout';
import { authApi } from '../../../shared/services/authApi';
import { API_URL as API } from '../../../shared/config.js';

async function responseData(response, fallback) {
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || fallback);
  if (!data) throw new Error('O servidor retornou uma resposta inválida. Tente novamente.');
  return data;
}

export function useFlowGenerate({ activeProjectId, projects, setProjects }) {
  const [generating, setGenerating] = useState(false);
  const operations = useRef(0);
  const begin = useCallback(() => { operations.current++; setGenerating(true); }, []);
  const finish = useCallback(() => { operations.current--; setGenerating(operations.current > 0); }, []);

  const updateProject = useCallback((projectId, patch) => {
    setProjects(prev => prev.map(project => project.id === projectId ? { ...project, ...patch } : project));
  }, [setProjects]);

  const addLog = useCallback((projectId, message) => {
    setProjects(prev => prev.map(project => project.id === projectId
      ? { ...project, aiLog: [...(project.aiLog ?? []), message] } : project));
  }, [setProjects]);

  const updateQueueItem = useCallback((projectId, itemId, patch) => {
    setProjects(prev => prev.map(project => project.id === projectId ? {
      ...project,
      processingQueue: (project.processingQueue ?? []).map(item => item.id === itemId ? { ...item, ...patch } : item),
    } : project));
  }, [setProjects]);

  const failProject = useCallback((projectId, message) => {
    setProjects(prev => prev.map(project => project.id === projectId ? {
      ...project,
      status: 'error',
      aiLog: [...(project.aiLog ?? []), `❌ Erro: ${message}`],
      processingQueue: (project.processingQueue ?? []).map(item =>
        ['generating', 'extracting'].includes(item.status) ? { ...item, status: 'error', error: message } : item),
    } : project));
  }, [setProjects]);

  const runQueueExtraction = useCallback(async (files, overrideProjectId) => {
    const projectId = overrideProjectId ?? activeProjectId;
    if (!files?.length || !projectId) return;
    begin();
    const queueItems = files.map(file => ({
      id: `qi_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      fileName: file.name, status: 'waiting',
    }));
    updateProject(projectId, {
      status: 'extracting', nodes: [], edges: [], promptText: '',
      aiLog: [`📄 Extraindo texto de ${files.length} arquivo(s)...`], processingQueue: queueItems,
    });
    try {
      const extractedTexts = [];
      // Process each file in order to avoid a burst of simultaneous AI requests.
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const itemId = queueItems[index].id;
        updateQueueItem(projectId, itemId, { status: 'extracting', error: undefined });
        addLog(projectId, `→ Lendo: ${file.name}...`);
        try {
          const form = new FormData();
          form.append('file', file);
          const response = await fetch(`${API}/api/process/extract-prompt`, {
            method: 'POST', headers: { Authorization: `Bearer ${authApi.getToken() ?? ''}` }, body: form,
          });
          const data = await responseData(response, `Falha ao extrair ${file.name}.`);
          if (!data.suggestedPrompt?.trim()) throw new Error('O arquivo não contém texto legível.');
          updateQueueItem(projectId, itemId, { status: 'done', extractedPrompt: data.suggestedPrompt });
          extractedTexts.push({ fileName: file.name, text: data.suggestedPrompt });
          addLog(projectId, `✓ Extraído: ${file.name}`);
        } catch (error) {
          updateQueueItem(projectId, itemId, { status: 'error', error: error.message });
          addLog(projectId, `❌ ${file.name}: ${error.message}`);
        }
      }
      if (!extractedTexts.length) throw new Error('Nenhum arquivo foi extraído. Confira os erros acima e tente novamente.');
      const combinedPrompt = extractedTexts.map(({ fileName, text }) =>
        files.length > 1 ? `[${fileName}]\n${text}` : text).join('\n\n---\n\n');
      updateProject(projectId, { status: 'ready', promptText: combinedPrompt });
      if (extractedTexts.length < files.length) {
        addLog(projectId, '⚠ Alguns arquivos falharam. O rascunho contém apenas os arquivos extraídos com sucesso.');
      }
      addLog(projectId, '✅ Revise o rascunho e clique em Gerar Fluxograma.');
    } catch (error) {
      failProject(projectId, error.message);
    } finally {
      finish();
    }
  }, [activeProjectId, begin, finish, updateProject, updateQueueItem, addLog, failProject]);

  const runQueueGeneration = useCallback(async (overrideProjectId, overridePrompt) => {
    const projectId = overrideProjectId ?? activeProjectId;
    const project = projects.find(item => item.id === projectId);
    if (!project) return;
    begin();
    // Keep the last usable graph if the provider fails during regeneration.
    updateProject(projectId, { status: 'generating' });
    const queue = (project.processingQueue ?? []).filter(item => item.extractedPrompt);
    const originalCombinedPrompt = queue.map(item => `[${item.fileName}]\n${item.extractedPrompt}`).join('\n\n---\n\n');
    const prompt = overridePrompt ?? project.promptText ?? '';
    const useMerge = queue.length > 1 && prompt.trim() === originalCombinedPrompt.trim();
    try {
      if (useMerge) {
        addLog(projectId, `── Gerando fluxograma integrado (${queue.length} arquivos)...`);
        updateQueueItem(projectId, queue[0].id, { status: 'generating', error: undefined });
        const baseResponse = await fetch(`${API}/api/process/generate`, {
          method: 'POST', headers: authApi.headers(),
          body: JSON.stringify({ prompt: queue[0].extractedPrompt, sourceFileName: queue[0].fileName }),
        });
        let graph = await responseData(baseResponse, 'Falha ao gerar o fluxograma base.');
        updateQueueItem(projectId, queue[0].id, { status: 'done' });
        let layout = getLayoutedElements(graph.nodes, graph.edges);
        updateProject(projectId, { nodes: layout.nodes, edges: layout.edges });
        for (const item of queue.slice(1)) {
          updateQueueItem(projectId, item.id, { status: 'generating', error: undefined });
          addLog(projectId, `→ Integrando: ${item.fileName}...`);
          const response = await fetch(`${API}/api/process/generate-merge`, {
            method: 'POST', headers: authApi.headers(),
            body: JSON.stringify({ existingGraph: graph, newDocumentText: item.extractedPrompt, sourceFileName: item.fileName }),
          });
          graph = await responseData(response, `Falha ao integrar ${item.fileName}.`);
          updateQueueItem(projectId, item.id, { status: 'done' });
          layout = getLayoutedElements(graph.nodes, graph.edges);
          updateProject(projectId, { nodes: layout.nodes, edges: layout.edges });
        }
        updateProject(projectId, { status: 'done' });
        addLog(projectId, `✅ Fluxograma integrado! (${layout.nodes.filter(node => node.type !== 'swimlane').length} nós)`);
      } else {
        if (!prompt.trim()) throw new Error('Nenhum texto para gerar o fluxograma.');
        for (const item of queue) updateQueueItem(projectId, item.id, { status: 'generating', error: undefined });
        addLog(projectId, '→ Enviando prompt para a IA...');
        const response = await fetch(`${API}/api/process/generate`, {
          method: 'POST', headers: authApi.headers(),
          body: JSON.stringify({ prompt, sourceFileName: queue.length === 1 ? queue[0].fileName : undefined }),
        });
        const data = await responseData(response, 'Falha ao gerar o fluxograma.');
        const layout = getLayoutedElements(data.nodes, data.edges);
        for (const item of queue) updateQueueItem(projectId, item.id, { status: 'done' });
        updateProject(projectId, { status: 'done', nodes: layout.nodes, edges: layout.edges });
        addLog(projectId, `✅ Fluxograma gerado! (${layout.nodes.filter(node => node.type !== 'swimlane').length} nós)`);
      }
    } catch (error) {
      failProject(projectId, error.message);
    } finally {
      finish();
    }
  }, [activeProjectId, projects, begin, finish, updateProject, updateQueueItem, addLog, failProject]);

  const runTextGeneration = useCallback(async text => {
    if (text?.trim() && activeProjectId) await runQueueGeneration(activeProjectId, text);
  }, [activeProjectId, runQueueGeneration]);

  return { generating, runQueueExtraction, runQueueGeneration, runTextGeneration };
}
