import React from 'react';
import { useTask } from '../contexts/TaskContext';

const TaskStats = () => {
  const { taskCounters } = useTask();
  
  return (
    <div className="stats-container">
      <div className="stat-card">
        <h3>Pendientes</h3>
        <p className="stat-value pending">{taskCounters.pending}</p>
      </div>
      
      <div className="stat-card">
        <h3>En Progreso</h3>
        <p className="stat-value in-progress">{taskCounters.inProgress}</p>
      </div>
      
      <div className="stat-card">
        <h3>Completadas</h3>
        <p className="stat-value completed">{taskCounters.completed}</p>
      </div>
    </div>
  );
};

export default TaskStats;