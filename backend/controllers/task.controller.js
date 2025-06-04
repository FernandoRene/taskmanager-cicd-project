const { Task } = require('../models');
const { Op } = require('sequelize');

// Crear una nueva tarea
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    // El estado siempre inicia como 'pendiente'
    const task = await Task.create({
      title,
      description,
      status: 'pendiente', // Estado por defecto
      dueDate: dueDate || null, // Usar dueDate si existe, de lo contrario null
      userId: req.user.id // El userId viene del middleware de autenticación
    });

    return res.status(201).json({
      message: 'Tarea creada exitosamente',
      task
    });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Obtener todas las tareas del usuario
exports.getTasks = async (req, res) => {
  try {
    const { status, search, dueDate } = req.query;
    let whereClause = { userId: req.user.id };

    // Filtrar por estado si se proporciona
    if (status) {
      whereClause.status = status;
    }

    // Filtrar por fecha de vencimiento si se proporciona
    if (dueDate) {
      whereClause.dueDate = dueDate;
    }

    // Búsqueda por título o descripción
    if (search) {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const tasks = await Task.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    return res.json({ tasks });
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Obtener una tarea específica
exports.getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({
      where: {
        id,
        userId: req.user.id // Asegurar que la tarea pertenece al usuario
      }
    });

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    return res.json({ task });
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Actualizar una tarea
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, dueDate } = req.body;

    // Buscar la tarea asegurando que pertenece al usuario
    const task = await Task.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    // Validaciones de logica de negocio del proyecto

    // 1. Una vez completada, no se puede modificar (solo eliminar)
    if (task.status === 'completada') {
      return res.status(400).json({
        message: 'No se puede modificar una tarea completada'
      });
    }

    // 2. Validar las transiciones de estado
    if (status) {
      // Solo se puede marcar como "en progreso" si está en "pendiente"
      if (status === 'en progreso' && task.status !== 'pendiente') {
        return res.status(400).json({
          message: 'Solo se puede cambiar a estado "en progreso" si esta en estado "pendiente"'
        });
      }

      // No se puede volver a "pendiente" desde "en progreso" o "completada"
      if (status === 'pendiente' && task.status !== 'pendiente') {
        return res.status(400).json({
          message: 'No se puede volver a "pendiente" desde otro estado'
        });
      }

      // Solo se puede marcar como "completada" si está en "en progreso"
      if (status === 'completada' && task.status !== 'en progreso') {
        return res.status(400).json({
          message: 'Solo se puede cambiar a estado "completada" si esta en "en progreso"'
        });
      }
    }

    // Actualizar la tarea con los campos proporcionados
    await task.update({
      title: title !== undefined ? title : task.title,
      description: description !== undefined ? description : task.description,
      status: status !== undefined ? status : task.status,
      dueDate: dueDate !== undefined ? dueDate : task.dueDate
    });

    return res.json({
      message: 'Tarea actualizada exitosamente',
      task
    });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Eliminar una tarea
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar y eliminar la tarea asegurando que pertenece al usuario
    const task = await Task.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    await task.destroy();

    return res.json({
      message: 'Tarea eliminada exitosamente',
      taskId: id
    });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Marcar una tarea como completada
exports.completeTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar la tarea asegurando que pertenece al usuario
    const task = await Task.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    // Solo se puede completar si está en progreso
    if (task.status !== 'en progreso') {
      return res.status(400).json({
        message: 'Solo se puede cambiar a estado completada una tarea en progreso'
      });
    }

    // Actualizar el estado a completada
    await task.update({ status: 'completada' });

    return res.json({
      message: 'Tarea marcada como completada',
      task
    });
  } catch (error) {
    console.error('Error al completar tarea:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }

};
