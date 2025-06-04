const express = require('express');
const router = express.Router();

const taskController = require('../controllers/task.controller');

// Middlewares
const authMiddleware = require('../middleware/authMiddleware');
const {
    createTaskValidations,
    updateTaskValidations,
    taskIdValidation,
    taskFilterValidations
} = require('../middleware/validationMiddleware');

// Rutas de tareas (todas protegidas con autenticación)
router.post('/tasks', authMiddleware, createTaskValidations, taskController.createTask);
router.get('/tasks', authMiddleware, taskFilterValidations, taskController.getTasks);
router.get('/tasks/:id', authMiddleware, taskIdValidation, taskController.getTask);
router.put('/tasks/:id', authMiddleware, updateTaskValidations, taskController.updateTask);
router.delete('/tasks/:id', authMiddleware, taskIdValidation, taskController.deleteTask);

// Ruta específica para marcar como completada
router.patch('/tasks/:id/complete', authMiddleware, taskIdValidation, taskController.completeTask);

module.exports = router;