export function normalizeTaskForUI(task = {}) {
  return {
    ...task,
    id: task.id ?? task.task_id ?? null,
    title: task.title ?? task.name ?? '',
    status: task.status ?? 'todo',
    userId: task.userId ?? task.user_id ?? null,
    taskDate: task.taskDate ?? task.task_date ?? null,
    description: task.description ?? task.desc ?? null,
    projectId: task.projectId ?? task.project_id ?? null,
    nodeId: task.nodeId ?? task.node_id ?? null,
  };
}
