'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define("Task", {
    title: {
      type: DataTypes.STRING,
      allowNull: false, // No permite valores nulos
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true // Opcional
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false, // No permite valores nulos
      validate: {
        isIn: [['pendiente', 'en progreso', 'completada']]
      },
      defaultValue: 'pendiente'
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true // Opcional
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Cambiado de 'User' a 'users'
        key: 'id'
      }
    }
  },
    {
      tableName: 'tasks'  // Nombre de la tabla tareas en la base de datos
    }
  );
  Task.associate = (models) => {
    Task.belongsTo(models.User, { foreignKey: "userId" });
  };


  // Hook para validar las reglas de transición de estado antes de actualizar
  Task.beforeUpdate(async (task) => {
    // Si el estado ha cambiado, aplicar las reglas
    if (task.changed('status')) {
      const previousStatus = task.previous('status');
      const newStatus = task.status;

      // Regla 1: No se puede volver a pendiente desde otro estado
      if (previousStatus !== 'pendiente' && newStatus === 'pendiente') {
        throw new Error('No se puede volver a "pendiente" desde otro estado');
      }

      // Regla 2: Sólo se puede marcar como "en progreso" si está en "pendiente"
      if (newStatus === 'en progreso' && previousStatus !== 'pendiente') {
        throw new Error('Solo se puede marcar como "en progreso" si está en "pendiente"');
      }

      // Regla 3: Sólo se puede marcar como "completada" si está en "en progreso"
      if (newStatus === 'completada' && previousStatus !== 'en progreso') {
        throw new Error('Solo se puede marcar como "completada" si está en "en progreso"');
      }
    }
  });

  return Task;
};