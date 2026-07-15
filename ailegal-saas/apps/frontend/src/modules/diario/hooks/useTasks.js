import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '../../../shared/services/tasksApi';
import { normalizeTaskForUI } from './normalizeTaskForUI';

export function useTasks(userId, selectedDateISO, currentUser, actingAs, onAuditRefresh) {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const actingAsPayload = actingAs
    ? { actingAsId: actingAs.id, actingAsName: actingAs.name }
    : null;

  const reload = useCallback(async () => {
    if (!userId || !selectedDateISO) return;
    setLoading(true);
    setError(null);
    try {
      const data = await tasksApi.list(selectedDateISO, selectedDateISO, userId);
      const normalized = (Array.isArray(data) ? data : []).map(normalizeTaskForUI);
      setTasks(normalized.filter(t => (t.userId ?? t.assignedTo ?? userId) === userId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedDateISO]);

  useEffect(() => { reload(); }, [reload]);

  const addTask = useCallback(async (title) => {
    if (!title.trim()) return;
    try {
      const created = await tasksApi.create({
        title: title.trim(),
        taskDate: selectedDateISO,
        status: 'todo',
        assignedTo: userId,
      });
      setTasks(prev => [...prev, normalizeTaskForUI(created)]);
      onAuditRefresh?.();
    } catch (err) {
      setError(err.message);
    }
  }, [selectedDateISO, userId, onAuditRefresh]);

  const updateStatus = useCallback(async (taskId, status) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    try {
      await tasksApi.updateStatus(taskId, status, actingAsPayload);
      onAuditRefresh?.();
    } catch (err) {
      setError(err.message);
      reload();
    }
  }, [reload, actingAsPayload, onAuditRefresh]);

  const removeTask = useCallback(async (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await tasksApi.remove(taskId, actingAsPayload);
      onAuditRefresh?.();
    } catch (err) {
      setError(err.message);
      reload();
    }
  }, [reload, actingAsPayload, onAuditRefresh]);

  return { tasks, loading, error, addTask, updateStatus, removeTask, reload };
}