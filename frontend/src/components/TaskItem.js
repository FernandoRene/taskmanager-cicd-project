import React, { useState } from 'react';
import { useTask } from '../contexts/TaskContext';
import '../styles/Task.css';

const TaskItem = ({ task, onEditTask }) => {
  const { completeTask, deleteTask } = useTask();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState(null);

  // Formatear fecha de vencimiento
  const formatDueDate = (dateString) => {
    if (!dateString) return 'Sin fecha límite';
    //console.log(dateString);
    const date = new Date(dateString);
    const formatter = new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
    const formattedDate = formatter.format(date);
    //console.log('Formatted Date:', formattedDate);
    return formattedDate;
  };

  // Obtener clase CSS según el estado de la tarea
  const getStatusClass = () => {
    switch (task.status) {
      case 'completada':
        return 'status-completed';
      case 'en progreso':
        return 'status-in-progress';
      default:
        return 'status-pending';
    }
  };

  // Manejar eliminación de tarea
  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      try {
        setIsDeleting(true);
        setError(null);
        await deleteTask(task.id);
      } catch (error) {
        setError('Error al eliminar la tarea');
        console.error('Error al eliminar tarea:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Manejar completado de tarea
  const handleComplete = async () => {
    try {
      setIsCompleting(true);
      setError(null);
      await completeTask(task.id);
    } catch (error) {
      setError('Error al completar la tarea');
      console.error('Error al completar tarea:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <li className="task-item">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="task-content">
        <div className="task-info">
          <h3 className="task-title">{task.title}</h3>

          {task.description && (
            <p className="task-description">{task.description}</p>
          )}

          <div className="task-meta">
            <span className={`status-badge ${getStatusClass()}`}>
              {task.status}
            </span>
            {task.dueDate === null ? (
              <span className="due-date-badge">Sin fecha límite</span>
            ) : task.dueDate && (
              <span className="due-date-badge">
                {formatDueDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>

        <div className="task-actions">
          {task.status !== 'completada' && (
            <>
              <button
                onClick={() => onEditTask(task)}
                className="action-button edit-button"
                title="Editar tarea"
                disabled={isDeleting || isCompleting}
              >
                ✏️
              </button>

              {task.status === 'en progreso' && (
                <button
                  onClick={handleComplete}
                  className="action-button complete-button"
                  title="Marcar como completada"
                  disabled={isDeleting || isCompleting}
                >
                  {isCompleting ? <div className="loader"></div> : '✓'}
                </button>
              )}
            </>
          )}

          <button
            onClick={handleDelete}
            className="action-button delete-button"
            title="Eliminar tarea"
            disabled={isDeleting || isCompleting}
          >
            {isDeleting ? <div className="loader"></div> : '🗑️'}
          </button>
        </div>
      </div>
    </li>
  );
};

export default TaskItem;