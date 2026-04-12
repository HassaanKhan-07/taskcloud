import React from 'react';

const StatsBar = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  if (total === 0) return null;

  return (
    <div className="mb-5">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500">
          {completed} of {total} completed
        </span>
        <span className="text-xs font-semibold text-purple-400">{percentage}%</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stats pills */}
      <div className="flex gap-2 mt-3">
        <div className="flex items-center gap-1.5 bg-slate-800/60 rounded-lg px-2.5 py-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-xs text-slate-400">{pending} pending</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-800/60 rounded-lg px-2.5 py-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-slate-400">{completed} done</span>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
