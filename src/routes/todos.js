const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  createTodo,
  getTodos,
  getTodo,
  updateTodo,
  deleteTodo,
} = require('../controllers/todoController');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Create todo
router.post('/', createTodo);

// Get all todos
router.get('/', getTodos);

// Get single todo
router.get('/:id', getTodo);

// Update todo
router.put('/:id', updateTodo);

// Delete todo
router.delete('/:id', deleteTodo);

module.exports = router;
