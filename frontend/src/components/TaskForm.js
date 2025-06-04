import React, { useState, useEffect } from 'react';
import { useTask } from '../contexts/TaskContext';
import '../styles/Task.css';

const TaskForm = ({ task = null, onClose }) => {
  const { createTask, updateTask } = useTask();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pendiente',
    dueDate: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const isEditing = !!task;

  // Cargar datos de la tarea si estamos editando
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pendiente',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      });
    }
  }, [task]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar errores cuando el usuario escribe
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'El título es obligatorio';
    }
    
    // Validar reglas de estado según la documentación
    if (isEditing) {
      // Solo se puede marcar como "en progreso" si está en "pendiente"
      if (task.status === 'pendiente' && formData.status === 'completada') {
        errors.status = 'No puedes marcar como completada directamente desde pendiente';
      }
      
      // No se puede volver a "pendiente" desde otro estado
      if (task.status !== 'pendiente' && formData.status === 'pendiente') {
        errors.status = 'No puedes volver a pendiente desde otro estado';
      }
      
      // Una vez "completada", no se puede modificar
      if (task.status === 'completada') {
        errors.general = 'No puedes modificar una tarea completada';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setApiError(null);
      
      try {
        if (isEditing) {
          await updateTask(task.id, formData);
        } else {
          await createTask(formData);
        }
        onClose();
      } catch (error) {
        console.error('Error al guardar tarea:', error);
        setApiError(error.response?.data?.message || 'Error al guardar la tarea');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="task-form-overlay">
      <div className="task-form">
        <div className="task-form-header">
          <h2 className="task-form-title">
            {isEditing ? 'Editar Tarea' : 'Crear Nueva Tarea'}
          </h2>
          <button
            onClick={onClose}
            className="task-form-close"
            title="Cerrar"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="task-form-content">
          {apiError && (
            <div className="error-message">
              {apiError}
            </div>
          )}
          
          {formErrors.general && (
            <div className="error-message">
              {formErrors.general}
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Título *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className={`form-input ${formErrors.title ? 'error' : ''}`}
              placeholder="Título de la tarea"
              value={formData.title}
              onChange={handleChange}
              disabled={isEditing && task.status === 'completada'}
            />
            {formErrors.title && (
              <p className="form-error">{formErrors.title}</p>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              className={`form-input ${formErrors.description ? 'error' : ''}`}
              placeholder="Descripción opcional"
              value={formData.description}
              onChange={handleChange}
              disabled={isEditing && task.status === 'completada'}
            ></textarea>
            {formErrors.description && (
              <p className="form-error">{formErrors.description}</p>
            )}
          </div>
          
          {isEditing && (
            <div className="form-group">
              <label className="form-label" htmlFor="status">
                Estado
              </label>
              <select
                id="status"
                name="status"
                className={`form-input ${formErrors.status ? 'error' : ''}`}
                value={formData.status}
                onChange={handleChange}
                disabled={task.status === 'completada'}
              >
                <option value="pendiente">Pendiente</option>
                <option value="en progreso">En progreso</option>
                <option value="completada">Completada</option>
              </select>
              {formErrors.status && (
                <p className="form-error">{formErrors.status}</p>
              )}
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label" htmlFor="dueDate">
              Fecha límite
            </label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              className={`form-input ${formErrors.dueDate ? 'error' : ''}`}
              value={formData.dueDate}
              onChange={handleChange}
              disabled={isEditing && task.status === 'completada'}
            />
            {formErrors.dueDate && (
              <p className="form-error">{formErrors.dueDate}</p>
            )}
          </div>
          
          <div className="task-form-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || (isEditing && task.status === 'completada')}
            >
              {isSubmitting 
                ? 'Guardando...' 
                : isEditing 
                  ? 'Actualizar' 
                  : 'Crear'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;