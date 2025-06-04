import React, { useEffect } from 'react';
import { useTask } from '../contexts/TaskContext';
import TaskItem from './TaskItem';
import TaskFilter from './TaskFilter';
import TaskSearch from './TaskSearch';
import '../styles/Task.css';

const TaskList = ({ onCreateTask, onEditTask }) => {
  const { 
    tasks, 
    loading, 
    error, 
    fetchTasks, 
    statusFilter, 
    searchTerm,
    filterByStatus,
    searchTasks
  } = useTask();

  // Cargar tareas al montar el componente
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Función para obtener el título según el filtro activo
  const getFilterTitle = () => {
    if (searchTerm) {
      return `Búsqueda: "${searchTerm}"`;
    }
    
    switch (statusFilter) {
      case 'pendiente':
        return 'Tareas Pendientes';
      case 'en progreso':
        return 'Tareas En Progreso';
      case 'completada':
        return 'Tareas Completadas';
      default:
        return 'Todas las Tareas';
    }
  };

  return (
    <div className="task-container">
      <div className="task-header">
        <h2 className="task-title">{getFilterTitle()}</h2>
        <button
          onClick={onCreateTask}
          className="add-task-button"
          title="Crear nueva tarea"
        >
          +
        </button>
      </div>
      
      <div className="task-controls">
        <TaskFilter 
          currentFilter={statusFilter} 
          onFilterChange={filterByStatus} 
        />
        <TaskSearch 
          searchTerm={searchTerm} 
          onSearch={searchTasks} 
        />
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="empty-state">
          <div className="loader"></div>
          <p>Cargando tareas...</p>
        </div>
      ) : tasks.length > 0 ? (
        <ul className="task-list">
          {tasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onEditTask={onEditTask} 
            />
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <p>No hay tareas que mostrar.</p>
          {(statusFilter || searchTerm) && (
            <button 
              onClick={() => {
                filterByStatus('');
                searchTasks('');
              }}
              className="btn btn-primary mt-2"
            >
              Quitar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskList;