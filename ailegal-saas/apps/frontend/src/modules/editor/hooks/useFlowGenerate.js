import { useState } from 'react';
import { getLayoutedElements } from '../../../shared/utils/layout';

export const useFlowGenerate = (projectsHook) => {
  const { setProjects, activeProject, updateProject, addLog, setActiveProjectId } = projectsHook;
  const [generating, setGenerating] = useState(false);

  const runGenerate = async () => {
    if (!activeProject || !activeProject.promptText.trim()) return;
    const projectId = activeProject.id;

    setGenerating(true);
    updateProject(projectId, { status: 'generating', nodes: [], edges: [] });

    try {
      addLog(projectId, '→ Enviando prompt para a IA (Gemini)...');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/process/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: activeProject.promptText })
      });
      if (!res.ok) throw new Error('Erro na API');

      addLog(projectId, '→ Estruturando JSON retornado...');
      const data = await res.json();

      addLog(projectId, '→ Aplicando algoritmo Dagre para Auto-Layout...');
      const layout = getLayoutedElements(data.nodes, data.edges);

      updateProject(projectId, { nodes: layout.nodes, edges: layout.edges, status: 'done' });
      addLog(projectId, `✓ Fluxograma gerado! (${layout.nodes.length} nós)`);
    } catch (err) {
      addLog(projectId, '❌ Erro: Falha ao gerar fluxograma.');
      updateProject(projectId, { status: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  const handleExtractPrompt = async (file) => {
    const projectId = `proj_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    setProjects(prev => [...prev, {
      id: projectId, name: file.name.replace(/\.(pdf|docx)$/i, ''), promptText: '',
      nodes: [], edges: [], status: 'extracting', aiLog: [`→ Lendo arquivo: ${file.name}...`], type: 'Automático',
    }]);
    setActiveProjectId(projectId);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/process/extract-prompt`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Erro ao processar arquivo');
      const data = await res.json();
      
      updateProject(projectId, { promptText: data.suggestedPrompt, status: 'ready' });
      addLog(projectId, '✓ Rascunho gerado! Revise e clique em Gerar Fluxograma.');
    } catch (err) {
      addLog(projectId, '❌ Erro ao processar o arquivo.');
      updateProject(projectId, { status: 'error' });
    }
  };

  return { generating, runGenerate, handleExtractPrompt };
};