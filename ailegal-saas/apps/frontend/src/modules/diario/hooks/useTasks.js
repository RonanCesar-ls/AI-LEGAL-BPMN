import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '../../../shared/services/tasksApi';

export function useTasks(userId, selectedDateISO) {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const reload = useCallback(async () => {
    if (!userId || !selectedDateISO) return;
    setLoading(true);
    setError(null);
    try {
      const data = await tasksApi.list(selectedDateISO, selectedDateISO, userId);
      setTasks(data.filter(t => t.userId === userId));
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
      setTasks(prev => [...prev, created]);
    } catch (err) {
      setError(err.message);
    }
  }, [selectedDateISO, userId]);

  const updateStatus = useCallback(async (taskId, status) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    try {
      await tasksApi.updateStatus(taskId, status);
    } catch (err) {
      setError(err.message);
      reload();
    }
  }, [reload]);

  const removeTask = useCallback(async (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await tasksApi.remove(taskId);
    } catch (err) {
      setError(err.message);
      reload();
    }
  }, [reload]);

  return { tasks, loading, error, addTask, updateStatus, removeTask, reload };
}