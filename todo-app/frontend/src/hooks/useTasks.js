import { useState, useEffect, useCallback } from 'react';
import { taskAPI } from '../utils/api';
import toast from 'react-hot-toast';

export const useTasks = (userId, filter = 'all') => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const apiFilter = filter !== 'all' ? filter : undefined;
      const { data } = await taskAPI.getAll(userId, apiFilter);
      setTasks(data.data || []);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [userId, filter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (title, priority = 'medium', dueDate, reminder = false, category = 'personal') => {
    const toastId = toast.loading('Adding task...');
    try {
      const { data } = await taskAPI.create({
        title,
        userId,
        priority,
        category,
        dueDate: dueDate || undefined,
        reminder,
      });
      setTasks(prev => [data.data, ...prev]);
      toast.success('Task added!', { id: toastId });
      return data.data;
    } catch (err) {
      toast.error(err.message || 'Failed to add task', { id: toastId });
      throw err;
    }
  };

  const toggleTask = async (id, currentCompleted) => {
    // Optimistic update
    setTasks(prev =>
      prev.map(t => t._id === id ? { ...t, completed: !currentCompleted } : t)
    );
    try {
      await taskAPI.update(id, { completed: !currentCompleted });
      toast.success(!currentCompleted ? '✓ Task completed!' : 'Task reopened');
    } catch (err) {
      // Rollback on error
      setTasks(prev =>
        prev.map(t => t._id === id ? { ...t, completed: currentCompleted } : t)
      );
      toast.error('Failed to update task');
    }
  };

  const editTask = async (id, title, priority, dueDate, reminder, category) => {
    const toastId = toast.loading('Saving...');
    try {
      const { data } = await taskAPI.update(id, {
        title,
        priority,
        category,
        dueDate: dueDate === '' ? null : dueDate,
        reminder,
      });
      setTasks(prev => prev.map(t => t._id === id ? data.data : t));
      toast.success('Task updated!', { id: toastId });
    } catch (err) {
      toast.error(err.message || 'Failed to update task', { id: toastId });
      throw err;
    }
  };

  const removeTask = async (id) => {
    const toastId = toast.loading('Deleting...');
    try {
      await taskAPI.delete(id);
      setTasks(prev => prev.filter(t => t._id !== id));
      toast.success('Task deleted', { id: toastId });
    } catch (err) {
      toast.error('Failed to delete task', { id: toastId });
    }
  };

  return { tasks, loading, error, addTask, toggleTask, editTask, removeTask, refetch: fetchTasks };
};
