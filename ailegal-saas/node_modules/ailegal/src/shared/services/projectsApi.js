const API = import.meta.env.VITE_API_URL;

/**
 * Camada de acesso à API de projetos.
 * Isola todas as chamadas HTTP em um único lugar.
 */
export const projectsApi = {

  // Carrega todos os projetos do usuário
  async list(userId) {
    const res = await fetch(`${API}/api/projects?userId=${userId}`);
    if (!res.ok) throw new Error('Falha ao carregar projetos.');
    return res.json();
  },

  // Cria um projeto novo no banco
  async create(project, userId) {
    const res = await fetch(`${API}/api/projects`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        userId,
        name:            project.name,
        type:            project.type            ?? 'Automático',
        status:          project.status          ?? 'idle',
        promptText:      project.promptText      ?? '',
        nodes:           project.nodes           ?? [],
        edges:           project.edges           ?? [],
        processingQueue: project.processingQueue ?? [],
      }),
    });
    if (!res.ok) throw new Error('Falha ao criar projeto.');
    return res.json();
  },

  // Salva o estado atual do projeto (nodes, edges, status)
  async save(project, userId) {
    const res = await fetch(`${API}/api/projects/${project.id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        userId,
        name:            project.name,
        type:            project.type,
        status:          project.status,
        promptText:      project.promptText,
        nodes:           project.nodes,
        edges:           project.edges,
        processingQueue: project.processingQueue,
      }),
    });
    if (!res.ok) throw new Error('Falha ao salvar projeto.');
    return res.json();
  },

  // Deleta um projeto
  async remove(projectId, userId) {
    const res = await fetch(`${API}/api/projects/${projectId}?userId=${userId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Falha ao deletar projeto.');
    return res.json();
  },
};