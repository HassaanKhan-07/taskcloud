import React from 'react';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

const FilterBar = ({ filter, onChange, counts }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 bg-gray-100 dark:bg-slate-900/80 rounded-2xl p-1.5">
      {FILTERS.map(f => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 ${
            filter === f.value
              ? 'bg-white dark:bg-slate-800 text-black dark:text-white shadow-sm shadow-gray-200/30 dark:shadow-slate-950/30'
              : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-900'
          }`}
        >
          {f.label}
          {counts && counts[f.value] !== undefined && (
            <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
              filter === f.value ? 'bg-purple-500/30 text-purple-300' : 'bg-gray-300 dark:bg-slate-700 text-gray-600 dark:text-slate-500'
            }`}>
              {counts[f.value]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default FilterBar;
