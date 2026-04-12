const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  deleteAllUserTasks,
} = require('../controllers/taskController');

// Validation rules
const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 500 }).withMessage('Title cannot exceed 500 characters'),
  body('userId')
    .notEmpty().withMessage('User ID is required'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('category')
    .optional()
    .isIn(['work', 'study', 'personal']).withMessage('Category must be work, study, or personal'),
  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('Due date must be a valid ISO date')
    .toDate(),
  body('reminder')
    .optional()
    .isBoolean().withMessage('Reminder must be a boolean'),
];

const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 500 }).withMessage('Title cannot exceed 500 characters'),
  body('completed')
    .optional()
    .isBoolean().withMessage('Completed must be a boolean'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('category')
    .optional()
    .isIn(['work', 'study', 'personal']).withMessage('Category must be work, study, or personal'),
  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('Due date must be a valid ISO date')
    .toDate(),
  body('reminder')
    .optional()
    .isBoolean().withMessage('Reminder must be a boolean'),
];

// Routes
// GET /tasks/:userId - Get all tasks for a user
router.get('/:userId', getTasks);

// POST /tasks - Create a new task
router.post('/', createTaskValidation, createTask);

// PUT /tasks/:id - Update a task
router.put('/:id', updateTaskValidation, updateTask);

// DELETE /tasks/user/:userId - Delete all tasks for a user (must be before /:id)
router.delete('/user/:userId', deleteAllUserTasks);

// DELETE /tasks/:id - Delete a task
router.delete('/:id', deleteTask);

module.exports = router;
