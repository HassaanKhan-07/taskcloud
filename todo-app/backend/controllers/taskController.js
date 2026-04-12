const Task = require('../models/Task');
const { validationResult } = require('express-validator');

// GET /tasks/:userId - Fetch all tasks for a user
const getTasks = async (req, res) => {
  try {
    const { userId } = req.params;
    const { filter, sort = 'createdAt', order = 'desc' } = req.query;

    let query = { userId };

    // Apply filter
    if (filter === 'completed') query.completed = true;
    if (filter === 'pending') query.completed = false;

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;

    const tasks = await Task.find(query).sort(sortObj);

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error('getTasks error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
  }
};

// POST /tasks - Create a new task
const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, userId, priority, category, dueDate, reminder } = req.body;

    if (reminder && !dueDate) {
      return res.status(400).json({ success: false, error: 'Reminder time is required when reminder is enabled' });
    }
    if (dueDate && new Date(dueDate).getTime() < Date.now()) {
      return res.status(400).json({ success: false, error: 'Reminder time must be in the future' });
    }

    const task = new Task({ title, userId, priority, category: category || 'personal', dueDate: dueDate || null, reminder: reminder || false });
    await task.save();

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully',
    });
  } catch (error) {
    console.error('createTask error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: 'Failed to create task' });
  }
};

// PUT /tasks/:id - Update a task
const updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { title, completed, priority, category, dueDate, reminder } = req.body;

    if (reminder && !dueDate) {
      return res.status(400).json({ success: false, error: 'Reminder time is required when reminder is enabled' });
    }
    if (dueDate && new Date(dueDate).getTime() < Date.now()) {
      return res.status(400).json({ success: false, error: 'Reminder time must be in the future' });
    }

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (completed !== undefined) updateFields.completed = completed;
    if (priority !== undefined) updateFields.priority = priority;
    if (category !== undefined) updateFields.category = category;
    if (dueDate !== undefined) updateFields.dueDate = dueDate || null;
    if (reminder !== undefined) updateFields.reminder = reminder;

    const task = await Task.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    res.status(200).json({
      success: true,
      data: task,
      message: 'Task updated successfully',
    });
  } catch (error) {
    console.error('updateTask error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid task ID' });
    }
    res.status(500).json({ success: false, error: 'Failed to update task' });
  }
};

// DELETE /tasks/:id - Delete a task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('deleteTask error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid task ID' });
    }
    res.status(500).json({ success: false, error: 'Failed to delete task' });
  }
};

// DELETE /tasks/user/:userId - Delete all tasks for a user
const deleteAllUserTasks = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await Task.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} tasks`,
    });
  } catch (error) {
    console.error('deleteAllUserTasks error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete tasks' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, deleteAllUserTasks };
