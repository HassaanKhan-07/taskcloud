import React from 'react';

const LoadingSpinner = ({ text = 'Loading tasks...' }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4">
    <div className="relative">
      <div className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-slate-700" />
      <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
    </div>
    <p className="text-sm text-gray-500 dark:text-slate-500">{text}</p>
  </div>
);

export default LoadingSpinner;
