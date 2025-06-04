import React from 'react';
import '../styles/Task.css';

const TaskFilter = ({ currentFilter, onFilterChange }) => {
  const filters = [
    { value: '', label: 'Todas' },
    { value: 'pendiente', label: 'Pendientes' },
    { value: 'en progreso', label: 'En progreso' },
    { value: 'completada', label: 'Completadas' }
  ];

  return (
    <div className="filter-group">
      <span className="filter-label">Estado:</span>
      <div className="filter-buttons">
        {filters.map(filter => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`filter-button ${currentFilter === filter.value ? 'active' : ''}`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TaskFilter;