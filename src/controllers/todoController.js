const Todo = require('../models/Todo');

// Create todo
const createTodo = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const todo = new Todo({
      user: req.userId,
      title,
      description,
      dueDate,
      priority,
    });

    await todo.save();

    res.status(201).json({
      message: 'Todo created successfully',
      todo,
    });
  } catch (error) {
    next(error);
  }
};

// Get all todos for user
const getTodos = async (req, res, next) => {
  try {
    const { completed } = req.query;
    
    const filter = { user: req.userId };
    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }

    // Cosmos DB can reject ORDER BY on createdAt when that path is not indexed.
    // Sorting by _id still gives a stable newest-first order without extra index setup.
    const todos = await Todo.find(filter).sort({ _id: -1 });

    res.json({
      count: todos.length,
      todos,
    });
  } catch (error) {
    next(error);
  }
};

// Get single todo
const getTodo = async (req, res, next) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findOne({
      _id: id,
      user: req.userId,
    });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json(todo);
  } catch (error) {
    next(error);
  }
};

// Update todo
const updateTodo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, completed, dueDate, priority } = req.body;

    const todo = await Todo.findOneAndUpdate(
      {
        _id: id,
        user: req.userId,
      },
      {
        $set: {
          title: title !== undefined ? title : undefined,
          description: description !== undefined ? description : undefined,
          completed: completed !== undefined ? completed : undefined,
          dueDate: dueDate !== undefined ? dueDate : undefined,
          priority: priority !== undefined ? priority : undefined,
        },
      },
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json({
      message: 'Todo updated successfully',
      todo,
    });
  } catch (error) {
    next(error);
  }
};

// Delete todo
const deleteTodo = async (req, res, next) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findOneAndDelete({
      _id: id,
      user: req.userId,
    });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTodo,
  getTodos,
  getTodo,
  updateTodo,
  deleteTodo,
};
