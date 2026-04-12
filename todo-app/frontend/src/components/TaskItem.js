import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const PRIORITY_CONFIG = {
  high: { label: 'High', color: 'text-red-400', dot: 'bg-red-400', ring: 'ring-red-400/30' },
  medium: { label: 'Medium', color: 'text-amber-400', dot: 'bg-amber-400', ring: 'ring-amber-400/30' },
  low: { label: 'Low', color: 'text-emerald-400', dot: 'bg-emerald-400', ring: 'ring-emerald-400/30' },
};

const CATEGORIES = [
  { value: 'work', label: 'Work', icon: '💼' },
  { value: 'study', label: 'Study', icon: '📚' },
  { value: 'personal', label: 'Personal', icon: '🎯' },
];

const TaskItem = ({ task, onToggle, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState(task.priority || 'medium');
  const [editCategory, setEditCategory] = useState(task.category || 'personal');
  const [editDueDate, setEditDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '');
  const [editReminder, setEditReminder] = useState(task.reminder || false);
  const [showTimerPicker, setShowTimerPicker] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const priority = PRIORITY_CONFIG[task.priority || 'medium'];

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
    setEditDueDate(formatDateTimeLocal(reminderTime));
    setEditReminder(true);
    setShowTimerPicker(false);
  };

  const handleToggleReminder = () => {
    setEditReminder(prev => {
      const next = !prev;
      if (next) {
        setShowTimerPicker(true);
      } else {
        setShowTimerPicker(false);
        setEditDueDate('');
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!editTitle.trim()) return;
    if (editReminder && !editDueDate) return;
    await onEdit(task._id, editTitle.trim(), editPriority, editReminder ? editDueDate : '', editReminder, editCategory);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(task._id);
  };

  useEffect(() => {
    setEditTitle(task.title);
    setEditPriority(task.priority || 'medium');
    setEditCategory(task.category || 'personal');
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '');
    setEditReminder(task.reminder || false);
  }, [task]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(task.title);
      setEditCategory(task.category || 'personal');
      setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '');
      setEditReminder(task.reminder || false);
    }
  };

  return (
    <div
      className={`group relative bg-slate-800/70 border border-slate-700/70 rounded-3xl px-5 py-4 transition-all duration-300 shadow-sm hover:shadow-xl hover:bg-slate-800/90 ${
        task.completed ? 'opacity-75' : ''
      } ${isDeleting ? 'opacity-0 scale-95 pointer-events-none' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task._id, task.completed)}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${
            task.completed
              ? 'bg-gradient-to-br from-purple-500 to-blue-600 border-transparent'
              : 'border-slate-600 hover:border-purple-400'
          }`}
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.completed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <input
                autoFocus
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Task title"
                className="w-full bg-slate-900/70 border border-purple-500/50 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
              
              {/* Edit Controls with Labels */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Priority</label>
                <select
                  value={editPriority}
                  onChange={e => setEditPriority(e.target.value)}
                  className={`w-full bg-slate-900/70 border rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 ${
                    editPriority === 'high'
                      ? 'border-red-400 text-red-300 focus:ring-red-500/30'
                      : editPriority === 'medium'
                      ? 'border-amber-400 text-amber-300 focus:ring-amber-500/30'
                      : 'border-emerald-400 text-emerald-300 focus:ring-emerald-500/30'
                  }`}
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟠 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Category</label>
                <select
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value)}
                  className="w-full bg-slate-900/70 border border-purple-400 text-purple-300 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                >
                  <option value="work">💼 Work</option>
                  <option value="study">📚 Study</option>
                  <option value="personal">🎯 Personal</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Alarm Time</label>
                <div className="space-y-3">
                  {/* Timer Picker UI */}
                  {editReminder && showTimerPicker ? (
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
                                value={editDueDate ? editDueDate.split('T')[0] : ''}
                                onChange={(e) => {
                                  const currentTime = editDueDate ? editDueDate.split('T')[1] : '00:00';
                                  setEditDueDate(`${e.target.value}T${currentTime}`);
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
                                value={editDueDate ? editDueDate.split('T')[1] : ''}
                                onChange={(e) => {
                                  const currentDate = editDueDate ? editDueDate.split('T')[0] : getMinDateTime().split('T')[0];
                                  setEditDueDate(`${currentDate}T${e.target.value}`);
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
                      {editDueDate && (
                        <div className="bg-slate-800/50 border border-emerald-400/30 rounded-lg p-3 flex items-center gap-3">
                          <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-emerald-300">Alarm set for</p>
                            <p className="text-sm font-semibold text-emerald-200 truncate">
                              {format(new Date(editDueDate), 'MMM d, yyyy • h:mm a')}
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
                            setEditReminder(false);
                            setEditDueDate('');
                            setShowTimerPicker(false);
                          }}
                          className="flex-1 px-3 py-2 text-xs font-medium bg-slate-700/50 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : editReminder ? (
                    /* Summary View */
                    <div className="bg-emerald-950/40 border border-emerald-400/30 rounded-lg p-3 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                        <div className="min-w-0">
                          <p className="text-xs text-emerald-400 font-semibold">🔔 Alarm Active</p>
                          <p className="text-sm font-semibold text-emerald-200 truncate">
                            {editDueDate ? format(new Date(editDueDate), 'MMM d • h:mm a') : 'Not set'}
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
              </div>

              <div className="flex items-center gap-3 pt-2">
                <div className="flex gap-1.5 ml-auto">
                  <button
                    onClick={handleSave}
                    disabled={!editTitle.trim() || (editReminder && !editDueDate)}
                    className={`px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-lg transition-colors ${
                      !editTitle.trim() || (editReminder && !editDueDate)
                        ? 'opacity-40 cursor-not-allowed hover:bg-purple-500/20'
                        : 'hover:bg-purple-500/40'
                    }`}
                  >Save</button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditTitle(task.title);
                      setEditCategory(task.category || 'personal');
                      setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '');
                      setEditReminder(task.reminder || false);
                    }}
                    className="px-3 py-1 bg-slate-700/50 hover:bg-slate-700 text-slate-400 text-xs rounded-lg transition-colors"
                  >Cancel</button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <p className={`text-sm font-medium leading-snug break-words ${
                task.completed ? 'line-through text-slate-500' : 'text-slate-200'
              }`}>
                {task.title}
              </p>
              
              {/* Metadata badges */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {/* Priority Badge */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  task.priority === 'high' 
                    ? 'bg-red-500/20 text-red-300 ring-1 ring-red-400/50'
                    : task.priority === 'medium'
                    ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/50'
                    : 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/50'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${priority.dot}`} />
                  {priority.label} Priority
                </span>

                {/* Category Badge */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-300 ring-1 ring-purple-400/50`}>
                  {task.category === 'work' ? '💼' : task.category === 'study' ? '📚' : '🎯'}
                  {task.category === 'work' ? 'Work' : task.category === 'study' ? 'Study' : 'Personal'}
                </span>

                {/* Alarm Time Badge */}
                {task.dueDate && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    task.reminder && new Date(task.dueDate) <= new Date() && !task.completed
                      ? 'bg-rose-500/25 text-rose-200 ring-1 ring-rose-400/60 animate-pulse'
                      : 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-400/50'
                  }`}>
                    <svg className={`w-4 h-4 ${
                      task.reminder && new Date(task.dueDate) <= new Date() && !task.completed ? 'animate-bounce' : ''
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {format(new Date(task.dueDate), 'MMM d, yyyy • h:mm a')}
                  </span>
                )}

                {/* Reminder Indicator */}
                {task.reminder && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-lime-500/20 text-lime-300 ring-1 ring-lime-400/50">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Alarm Set
                  </span>
                )}
              </div>

              {/* Creation date */}
              <p className="mt-2 text-xs text-slate-500">
                Added {format(new Date(task.createdAt), 'MMM d, yyyy')}
              </p>
            </>
          )}
        </div>

        {/* Action buttons */}
        {!isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
              aria-label="Edit task"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
              aria-label="Delete task"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
