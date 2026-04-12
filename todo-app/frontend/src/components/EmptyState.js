import React from 'react';

const MESSAGES = {
  all: { title: 'No tasks yet', sub: 'Add your first task above to get started.' },
  pending: { title: 'No pending tasks', sub: 'All caught up! Great work.' },
  completed: { title: 'No completed tasks', sub: 'Complete a task and it will appear here.' },
};

const EmptyState = ({ filter = 'all' }) => {
  const { title, sub } = MESSAGES[filter] || MESSAGES.all;

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-1">
        {filter === 'completed' ? (
          <svg className="w-7 h-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-7 h-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )}
      </div>
      <p className="text-sm font-medium text-slate-400">{title}</p>
      <p className="text-xs text-slate-600 text-center max-w-[200px]">{sub}</p>
    </div>
  );
};

export default EmptyState;
