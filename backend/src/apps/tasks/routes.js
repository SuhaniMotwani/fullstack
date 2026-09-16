const express = require('express');
const router = express.Router();
const tasksController = require('./controller');

// Tasks CRUD endpoints
router.get('/', tasksController.getTasks);
router.get('/tasks', tasksController.getTasks);

router.post('/', tasksController.createTask);
router.post('/tasks', tasksController.createTask);

router.get('/:id', tasksController.getTask);
router.get('/tasks/:id', tasksController.getTask);

router.put('/:id', tasksController.updateTask);
router.put('/tasks/:id', tasksController.updateTask);

router.delete('/:id', tasksController.deleteTask);
router.delete('/tasks/:id', tasksController.deleteTask);

// Log expense against a task
router.post('/:id/expense', tasksController.logExpense);
router.post('/tasks/:id/expense', tasksController.logExpense);

module.exports = router;
