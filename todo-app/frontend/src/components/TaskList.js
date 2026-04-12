import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../hooks/useTasks';
import AddTask from './AddTask';
import TaskItem from './TaskItem';
import FilterBar from './FilterBar';
import StatsBar from './StatsBar';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

const TaskList = () => {
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [addingTask, setAddingTask] = useState(false);

  const { tasks, loading, addTask, toggleTask, editTask, removeTask } = useTasks(
    currentUser?.uid,
    filter
  );

  // Get all tasks for stats and counts
  const allTasks = useTasks(currentUser?.uid, 'all');

  // Filter tasks by category
  const filteredTasks = categoryFilter === 'all' 
    ? tasks 
    : tasks.filter(t => t.category === categoryFilter);

  // Counts for filter tabs
  const counts = useMemo(() => {
    const all = allTasks.tasks;
    return {
      all: all.length,
      pending: all.filter(t => !t.completed).length,
      completed: all.filter(t => t.completed).length,
    };
  }, [allTasks.tasks]);

  // Wrap actions to refetch all tasks for real-time stats update
  const handleToggle = async (id, currentCompleted) => {
    await toggleTask(id, currentCompleted);
    allTasks.refetch();
  };

  const handleEdit = async (id, title, priority, dueDate, reminder, category) => {
    await editTask(id, title, priority, dueDate, reminder, category);
    allTasks.refetch();
  };

  const handleDelete = async (id) => {
    await removeTask(id);
    allTasks.refetch();
  };

  const permissionRequested = useRef(false);
  const reminderNotified = useRef(new Map());

  const requestNotificationPermission = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (!permissionRequested.current && Notification.permission === 'default') {
      Notification.requestPermission();
      permissionRequested.current = true;
    }
  };

  const handleAdd = async (title, priority, dueDate, reminder, category) => {
    setAddingTask(true);
    try {
      await addTask(title, priority, dueDate, reminder, category);
      allTasks.refetch();
    } finally {
      setAddingTask(false);
    }
  };

  useEffect(() => {
    requestNotificationPermission();

    const checkReminders = () => {
      const now = Date.now();
      tasks.forEach((task) => {
        if (!task.reminder || task.completed || !task.dueDate) {
          return;
        }

        const dueTime = new Date(task.dueDate).getTime();
        if (Number.isNaN(dueTime) || dueTime > now) {
          return;
        }

        const lastDue = reminderNotified.current.get(task._id);
        if (lastDue === task.dueDate) {
          return;
        }

        reminderNotified.current.set(task._id, task.dueDate);
        const body = `${task.title} was not completed by the selected reminder time.`;

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Task reminder', {
            body,
            tag: task._id,
          });
        } else {
          toast.error(body);
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 15000);
    return () => clearInterval(interval);
  }, [tasks]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-0">
      <div className="mb-8 rounded-[32px] bg-slate-900/95 border border-slate-800/75 p-7 shadow-2xl shadow-slate-950/20">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Today’s focus</p>
            <h2 className="text-3xl font-semibold text-white tracking-tight sm:text-4xl">
              Good {getGreeting()},{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                {currentUser?.displayName?.split(' ')[0] || 'there'}
              </span>
            </h2>
            <p className="max-w-2xl text-sm text-slate-400 leading-6">
              A clean workspace for your tasks, priorities, and progress. Keep momentum with a polished dashboard designed for laptops.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-800/80 border border-slate-700/70 px-5 py-4 text-sm text-slate-300">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Task summary</div>
            <div className="mt-3 flex gap-3 flex-wrap">
              <span className="rounded-2xl bg-slate-900/90 px-3 py-2 text-xs font-semibold text-white">{counts.all} total</span>
              <span className="rounded-2xl bg-slate-900/90 px-3 py-2 text-xs text-slate-300">{counts.pending} pending</span>
              <span className="rounded-2xl bg-slate-900/90 px-3 py-2 text-xs text-slate-300">{counts.completed} completed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.9fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] bg-slate-900/90 border border-slate-800/70 p-5 shadow-xl shadow-slate-950/15">
            <div className="mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Create task</h3>
              <p className="text-sm text-slate-500 mt-2">Quickly add new items with priority and stay on top of what matters most.</p>
            </div>
            <AddTask onAdd={handleAdd} loading={addingTask} />
          </div>

          <div className="rounded-[32px] bg-slate-900/90 border border-slate-800/70 p-5 shadow-xl shadow-slate-950/15">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400 mb-4">Progress overview</h3>
            <StatsBar tasks={allTasks.tasks} />
          </div>
        </div>

        <div className="rounded-[32px] bg-slate-900/90 border border-slate-800/70 p-5 shadow-xl shadow-slate-950/15">
          <div className="flex flex-col gap-4 mb-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <FilterBar filter={filter} onChange={setFilter} counts={counts} />
              <span className="text-xs text-slate-500">Showing {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}</span>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-slate-500 font-medium">Category:</span>
              {['all', 'work', 'study', 'personal'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    categoryFilter === cat
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'bg-slate-900/70 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat === 'work' ? '💼 Work' : cat === 'study' ? '📚 Study' : '🎯 Personal'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : filteredTasks.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <div className="space-y-3">
              {filteredTasks.map(task => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export default TaskList;
