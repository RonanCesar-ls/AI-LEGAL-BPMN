import { useCallback, useState } from 'react';
import { getLayoutedElements } from '../../../shared/utils/layout';
import { authApi } from '../../../shared/services/authApi';

const API = import.meta.env.VITE_API_URL;

export function useFlowGenerate({ activeProjectId, setProjects }) {
  const [generating, setGenerating] = useState(false);

  const updateProject = useCallback((projectId, patch) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, ...patch } : p
    ));
  }, [setProjects]);

  const addLog = useCallback((projectId, msg) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, aiLog: [...(p.aiLog ?? []), msg] }
        : p
    ));
  }, [setProjects]);

  const updateQueueItem = useCallback((projectId, itemId, patch) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        processingQueue: p.processingQueue.map(item =>
          item.id === itemId ? { ...item, ...patch } : item
        ),
      };
    }));
  }, [setProjects]);

  const runQueueExtraction = useCallback(async (files, overrideProjectId) => {
    const targetProjectId = overrideProjectId ?? activeProjectId;
    if (!files?.length || !targetProjectId) return;

    setGenerating(true);

    let targetProject = null;
    setProjects(prev => {
      targetProject = prev.find(p => p.id === targetProjectId) ?? null;
      return prev;
    });

    await new Promise(r => setTimeout(r, 100));

    if (!targetProject) {
      await new Promise(r => setTimeout(r, 500));
      setProjects(prev => {
        targetProject = prev.find(p => p.id === targetProjectId) ?? null;
        return prev;
      });
    }

    if (!targetProject) {
      console.error("Erro: Projeto não encontrado no estado para extração.");
      setGenerating(false);
      return;
    }

    const queueItems = files.map(file => ({
      id:       `qi_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      fileName: file.name,
      status:   'waiting',
    }));

    updateProject(targetProjectId, {
      status:          'extracting',
      nodes:           [],
      edges:           [],
      aiLog:           [`📄 Extraindo texto de ${files.length} arquivo(s)...`],
      processingQueue: queueItems,
      promptText:      '',
    });

    try {
      const extractedTexts = await Promise.all(
        files.map(async (file, idx) => {
          const itemId = queueItems[idx].id;

          updateQueueItem(targetProjectId, itemId, { status: 'extracting' });
          addLog(targetProjectId, `→ Lendo: ${file.name}...`);

          const formData = new FormData();
          formData.append('file', file);

          const headers = authApi.headers();
          delete headers['Content-Type'];

          const res = await fetch(`${API}/api/process/extract-prompt`, {
            method: 'POST',
            headers,
            body: formData,
          });

          if (!res.ok) throw new Error(`Falha ao extrair ${file.name}`);

          const data = await res.json();
          const extracted = data.suggestedPrompt ?? '';

          updateQueueItem(targetProjectId, itemId, {
            status: 'done',
            extractedPrompt: extracted,
          });
          addLog(targetProjectId, `✓ Extraído: ${file.name}`);

          return { fileName: file.name, text: extracted };
        })
      );

      const combinedPrompt = extractedTexts
        .map(({ fileName, text }) =>
          files.length > 1 ? `[${fileName}]\n${text}` : text
        )
        .join('\n\n---\n\n');

      updateProject(targetProjectId, {
        status:     'ready',
        promptText: combinedPrompt,
      });

      addLog(targetProjectId, '✅ Extração concluída! Revise o rascunho e clique em Gerar Fluxograma.');

    } catch (error) {
      addLog(targetProjectId, `❌ Erro: ${error.message}`);
      updateProject(targetProjectId, { status: 'error' });
    } finally {
      setGenerating(false);
    }
  }, [activeProjectId, setProjects, updateProject, addLog, updateQueueItem]);

  const runQueueGeneration = useCallback(async (overrideProjectId) => {
    const targetProjectId = overrideProjectId ?? activeProjectId;
    if (!targetProjectId) return;

    setGenerating(true);

    let targetProject = null;
    setProjects(prev => {
      targetProject = prev.find(p => p.id === targetProjectId) ?? null;
      return prev;
    });

    await new Promise(r => setTimeout(r, 0));

    updateProject(targetProjectId, { status: 'generating', nodes: [], edges: [] });

    try {
      const queue = (targetProject?.processingQueue ?? [])
        .filter(item => item.extractedPrompt);

      const hasMultiQueue = queue.length > 1;
      const hasSingleQueue = queue.length === 1;

      if (hasMultiQueue) {
        addLog(targetProjectId, `── Gerando fluxograma integrado (${queue.length} arquivos)...`);

        updateQueueItem(targetProjectId, queue[0].id, { status: 'generating' });
        addLog(targetProjectId, `→ Gerando base: ${queue[0].fileName}...`);

        const baseRes = await fetch(`${API}/api/process/generate`, {
          method:  'POST',
          headers: authApi.headers(),
          body:    JSON.stringify({
            prompt:         queue[0].extractedPrompt,
            sourceFileName: queue[0].fileName,
          }),
        });

        if (!baseRes.ok) throw new Error(`Falha ao gerar base`);

        let currentGraph = await baseRes.json();
        updateQueueItem(targetProjectId, queue[0].id, { status: 'done' });
        addLog(targetProjectId, `✓ Base gerada (${currentGraph.nodes?.length ?? 0} nós)`);

        const partial1 = getLayoutedElements(currentGraph.nodes, currentGraph.edges);
        updateProject(targetProjectId, { nodes: partial1.nodes, edges: partial1.edges });

        for (let i = 1; i < queue.length; i++) {
          const item = queue[i];
          updateQueueItem(targetProjectId, item.id, { status: 'generating' });
          addLog(targetProjectId, `→ Integrando: ${item.fileName}...`);

          const mergeRes = await fetch(`${API}/api/process/generate-merge`, {
            method:  'POST',
            headers: authApi.headers(),
            body:    JSON.stringify({
              existingGraph:   currentGraph,
              newDocumentText: item.extractedPrompt,
              sourceFileName:  item.fileName,
            }),
          });

          if (!mergeRes.ok) throw new Error(`Falha ao integrar: ${item.fileName}`);
          currentGraph = await mergeRes.json();

          updateQueueItem(targetProjectId, item.id, { status: 'done' });
          addLog(targetProjectId, `✓ Integrado (${currentGraph.nodes?.length ?? 0} nós total)`);

          const partialLayout = getLayoutedElements(currentGraph.nodes, currentGraph.edges);
          updateProject(targetProjectId, { nodes: partialLayout.nodes, edges: partialLayout.edges });
        }

        addLog(targetProjectId, '── Aplicando layout final...');
        const finalLayout = getLayoutedElements(currentGraph.nodes, currentGraph.edges);
        updateProject(targetProjectId, {
          status: 'done',
          nodes:  finalLayout.nodes,
          edges:  finalLayout.edges,
        });
        addLog(targetProjectId, `✅ Pronto! ${finalLayout.nodes.filter(n => n.type !== 'swimlane').length} nós em ${queue.length} processo(s).`);

      } else {
        const prompt = hasSingleQueue
          ? queue[0].extractedPrompt
          : (targetProject?.promptText ?? '');

        if (!prompt.trim()) throw new Error('Nenhum texto para gerar o fluxograma.');

        addLog(targetProjectId, '→ Enviando prompt para a IA...');

        if (hasSingleQueue) {
          updateQueueItem(targetProjectId, queue[0].id, { status: 'generating' });
        }

        const res = await fetch(`${API}/api/process/generate`, {
          method:  'POST',
          headers: authApi.headers(),
          body:    JSON.stringify({
            prompt,
            sourceFileName: hasSingleQueue ? queue[0].fileName : undefined,
          }),
        });

        if (!res.ok) throw new Error('Erro na API');

        addLog(targetProjectId, '→ Aplicando layout...');
        const data   = await res.json();
        const layout = getLayoutedElements(data.nodes, data.edges);

        if (hasSingleQueue) {
          updateQueueItem(targetProjectId, queue[0].id, { status: 'done' });
        }

        updateProject(targetProjectId, {
          status: 'done',
          nodes:  layout.nodes,
          edges:  layout.edges,
        });
        addLog(targetProjectId, `✅ Fluxograma gerado! (${layout.nodes.filter(n => n.type !== 'swimlane').length} nós)`);
      }

    } catch (err) {
      addLog(targetProjectId, `❌ Erro: ${err.message}`);
      updateProject(targetProjectId, { status: 'error' });
    } finally {
      setGenerating(false);
    }
  }, [activeProjectId, setProjects, updateProject, addLog, updateQueueItem]);

  const runTextGeneration = useCallback(async (promptText) => {
    if (!promptText?.trim() || !activeProjectId) return;
    await runQueueGeneration(activeProjectId);
  }, [activeProjectId, runQueueGeneration]);

  return { generating, runQueueExtraction, runQueueGeneration, runTextGeneration };
}