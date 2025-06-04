import React, { useState } from 'react';
import '../styles/Task.css';

const TaskSearch = ({ searchTerm, onSearch }) => {
  const [term, setTerm] = useState(searchTerm);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(term);
  };

  const handleClear = () => {
    setTerm('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className="search-input-container">
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Buscar tareas..."
          className="search-input"
        />
        {term && (
          <button
            type="button"
            onClick={handleClear}
            className="search-clear"
            title="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>
      <button
        type="submit"
        className="search-button"
        title="Buscar"
      >
        🔍
      </button>
    </form>
  );
};

export default TaskSearch;