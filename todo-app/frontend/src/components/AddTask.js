import React, { useState } from 'react';
import { format } from 'date-fns';

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-emerald-400' },
  { value: 'medium', label: 'Medium', color: 'text-amber-400' },
  { value: 'high', label: 'High', color: 'text-red-400' },
];

const CATEGORIES = [
  { value: 'work', label: 'Work', icon: '💼' },
  { value: 'study', label: 'Study', icon: '📚' },
  { value: 'personal', label: 'Personal', icon: '🎯' },
];

const AddTask = ({ onAdd, loading }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('personal');
  const [dueDate, setDueDate] = useState('');
  const [reminder, setReminder] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');
  const [showTimerPicker, setShowTimerPicker] = useState(false);

  const TIMER_PRESETS = [
    { label: '1 min', minutes: 1 },
    { label: '5 min', minutes: 5 },
    { label: '15 min', minutes: 15 },
    { label: '30 min', minutes: 30 },
    { label: '1 hour', minutes: 60 },
    { label: '2 hours', minutes: 120 },
  ];

  // Get current time in IST (UTC+5:30)
  const getISTNow = () => {
    const now = new Date();
    const userOffset = now.getTimezoneOffset() * 60 * 1000;
    const utc = now.getTime() + userOffset;
    const ist = new Date(utc + (5.5 * 60 * 60 * 1000));
    return ist;
  };

  // Format date for datetime-local input
  const formatDateTimeLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getMinDateTime = () => {
    const nextMinute = new Date(getISTNow().getTime() + 60000);
    return formatDateTimeLocal(nextMinute);
  };

  const setReminderFromPreset = (minutes) => {
    const now = getISTNow();
    const reminderTime = new Date(now.getTime() + minutes * 60000);
    setDueDate(formatDateTimeLocal(reminderTime));
    setReminder(true);
    setShowTimerPicker(false);
  };

  const handleToggleReminder = () => {
    setReminder(prev => {
      const next = !prev;
      if (next) {
        setShowTimerPicker(true);
      } else {
        setShowTimerPicker(false);
        setDueDate('');
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (reminder && !dueDate) {
      setError('Please select a reminder time.');
      return;
    }
    if (dueDate && new Date(dueDate).getTime() < Date.now()) {
      setError('Reminder time must be in the future.');
      return;
    }

    setError('');
    await onAdd(title.trim(), priority, reminder ? dueDate : '', reminder, category);
    setTitle('');
    setPriority('medium');
    setCategory('personal');
    setDueDate('');
    setReminder(false);
    setExpanded(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setExpanded(false);
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className={`bg-slate-800/60 border rounded-xl overflow-hidden transition-all duration-300 ${
        expanded ? 'border-purple-500/50 shadow-lg shadow-purple-500/10' : 'border-slate-700/50'
      }`}>
        {/* Main input row */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-shrink-0 w-5 h-5 rounded-md border-2 border-dashed border-slate-600 flex items-center justify-center">
            <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onFocus={() => setExpanded(true)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new task..."
            maxLength={500}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none"
          />
          {title && (
            <button
              type="button"
              onClick={() => { setTitle(''); setExpanded(false); }}
              className="text-slate-600 hover:text-slate-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Expanded options */}
        {expanded && (
          <div className="px-4 pb-3 space-y-3 border-t border-slate-700/50 pt-3">
            {/* Priority & Category */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 flex items-center gap-1.5">
                <span className="text-xs text-slate-500 whitespace-nowrap">Priority:</span>
                <div className="flex gap-1">
                  {PRIORITIES.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        priority === p.value
                          ? `bg-slate-700 ${p.color} ring-1 ring-current/30`
                          : 'text-slate-500 hover:text-slate-400'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 flex items-center gap-1.5">
                <span className="text-xs text-slate-500 whitespace-nowrap">Category:</span>
                <div className="flex gap-1">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                        category === c.value
                          ? 'bg-slate-700 text-white ring-1 ring-purple-500'
                          : 'text-slate-500 hover:text-slate-400'
                      }`}
                    >
                      <span>{c.icon}</span>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">Alarm & Reminder</label>
              
              {/* Timer Picker UI */}
              {reminder && showTimerPicker ? (
                <div className="bg-gradient-to-br from-blue-950/40 to-slate-900/40 border border-blue-400/30 rounded-xl p-4 space-y-4">
                  {/* Quick Presets */}
                  <div>
                    <p className="text-xs font-semibold text-blue-300 mb-2.5 uppercase tracking-wide">Quick Select</p>
                    <div className="grid grid-cols-3 gap-2">
                      {TIMER_PRESETS.map(preset => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setReminderFromPreset(preset.minutes)}
                          className="px-2 py-2 text-xs font-medium bg-blue-500/20 hover:bg-blue-500/40 text-blue-200 rounded-lg transition-all border border-blue-400/50 hover:border-blue-300"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Datetime Picker */}
                  <div className="border-t border-blue-400/20 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm font-semibold text-blue-300 uppercase tracking-wide">Custom Time</p>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Date Input */}
                      <div className="relative">
                        <label className="block text-xs font-medium text-blue-200 mb-1.5">Select Date</label>
                        <div className="relative">
                          <input
                            type="date"
                            value={dueDate ? dueDate.split('T')[0] : ''}
                            onChange={(e) => {
                              const currentTime = dueDate ? dueDate.split('T')[1] : '00:00';
                              setDueDate(`${e.target.value}T${currentTime}`);
                            }}
                            min={getMinDateTime().split('T')[0]}
                            className="w-full bg-slate-900/80 border border-blue-400/60 text-blue-200 rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-300 transition-all pr-10"
                          />
                          <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>

                      {/* Time Input */}
                      <div className="relative">
                        <label className="block text-xs font-medium text-blue-200 mb-1.5">Select Time</label>
                        <div className="relative">
                          <input
                            type="time"
                            value={dueDate ? dueDate.split('T')[1] : ''}
                            onChange={(e) => {
                              const currentDate = dueDate ? dueDate.split('T')[0] : getMinDateTime().split('T')[0];
                              setDueDate(`${currentDate}T${e.target.value}`);
                            }}
                            className="w-full bg-slate-900/80 border border-blue-400/60 text-blue-200 rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-300 transition-all pr-10"
                          />
                          <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Time Display */}
                  {dueDate && (
                    <div className="bg-slate-800/50 border border-emerald-400/30 rounded-lg p-3 flex items-center gap-3">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-emerald-300">Alarm set for</p>
                        <p className="text-sm font-semibold text-emerald-200 truncate">
                          {format(new Date(dueDate), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowTimerPicker(false)}
                      className="flex-1 px-3 py-2 text-xs font-medium bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 rounded-lg transition-colors border border-emerald-400/50"
                    >
                      Done
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReminder(false);
                        setDueDate('');
                        setShowTimerPicker(false);
                      }}
                      className="flex-1 px-3 py-2 text-xs font-medium bg-slate-700/50 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : reminder ? (
                /* Summary View */
                <div className="bg-emerald-950/40 border border-emerald-400/30 rounded-lg p-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-xs text-emerald-400 font-semibold">🔔 Alarm Active</p>
                      <p className="text-sm font-semibold text-emerald-200 truncate">
                        {dueDate ? format(new Date(dueDate), 'MMM d • h:mm a') : 'Not set'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTimerPicker(true)}
                    className="px-2 py-1 text-xs font-medium bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-300 rounded transition-colors flex-shrink-0"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                /* Inactive State */
                <button
                  type="button"
                  onClick={handleToggleReminder}
                  className="w-full px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/40 hover:to-blue-600/40 text-blue-300 rounded-lg transition-all border border-blue-400/50 hover:border-blue-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Set Timer & Reminder
                </button>
              )}
            </div>
            {error && <p className="text-xs text-rose-400">{error}</p>}

            {/* Character count */}
            {title.length > 400 && (
              <span className={`text-xs ml-auto ${title.length > 480 ? 'text-red-400' : 'text-slate-500'}`}>
                {500 - title.length} left
              </span>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!title.trim() || loading}
              className="ml-auto px-4 py-1.5 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-all duration-200"
            >
              {loading ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        )}
      </div>
    </form>
  );
};

export default AddTask;
