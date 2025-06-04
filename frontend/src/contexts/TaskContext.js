import React, { createContext, useState, useContext, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// URL base de la API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Crear el contexto de tareas
export const TaskContext = createContext();

// Hook personalizado para usar el contexto de tareas
export const useTask = () => useContext(TaskContext);

// Proveedor del contexto de tareas
export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { isAuthenticated } = useAuth();

  // Referencias para gestionar la lógica de reintentos y limitación de frecuencia
  const timeoutRef = useRef(null);
  const fetchingRef = useRef(false);
  const retryCountRef = useRef(0);
  const lastFetchTimeRef = useRef(0);
  const maxRetries = 3;

  // Calcular contadores de tareas por estado con compatibilidad para múltiples formatos
  const taskCounters = useMemo(() => {
    // Estados posibles (expandir según sea necesario)
    const pendingStatuses = ['pendiente', 'pending', 'to-do', 'nueva', 'new'];
    const inProgressStatuses = ['en progreso', 'inProgress', 'in progress', 'in-progress', 'en-progreso'];
    const completedStatuses = ['completada', 'completed', 'done', 'finalizada', 'complete'];
    
    // Contar por estado
    const pending = tasks.filter(task => pendingStatuses.includes(task.status?.toLowerCase())).length;
    const inProgress = tasks.filter(task => inProgressStatuses.includes(task.status?.toLowerCase())).length;
    const completed = tasks.filter(task => completedStatuses.includes(task.status?.toLowerCase())).length;
    
    // Para depuración
    //console.log("Estado de tareas contabilizadas:", { pending, inProgress, completed });
    //console.log("Total de tareas:", tasks.length);
    
    // Si hay un desajuste, imprimir los estados únicos para diagnosticar
    if (pending + inProgress + completed !== tasks.length) {
      const uniqueStatuses = [...new Set(tasks.map(task => task.status))];
      console.log("Estados únicos encontrados:", uniqueStatuses);
    }
    
    return {
      pending,
      inProgress,
      completed,
      total: tasks.length
    };
  }, [tasks]);

  // Función para obtener todas las tareas con control de frecuencia y reintentos
  const fetchTasks = useCallback(async (force = false) => {
    // Si no está autenticado, no hacer nada
    if (!isAuthenticated) return;
    
    // Evitar peticiones simultáneas
    if (fetchingRef.current && !force) return;
    
    // Limitar frecuencia de peticiones a menos que sea forzado
    const now = Date.now();
    if (!force && (now - lastFetchTimeRef.current < 15000)) {
      return;
    }
    
    fetchingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      // Construir URL con parámetros de filtro
      let url = `${API_URL}/tasks`;
      const params = new URLSearchParams();
      
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      const response = await axios.get(url);
      
      // Extraer las tareas de la respuesta
      const fetchedTasks = response.data.tasks || response.data;
      
      // Log para depuración
      //console.log("Tareas recibidas del servidor:", fetchedTasks);
      
      // Actualizar el estado con las tareas obtenidas
      setTasks(fetchedTasks);
      //console.log('Tareas recibidas del servidor:', fetchedTasks); // revsión de data recibida acutualizada
      // Resetear contador de reintentos en caso de éxito
      retryCountRef.current = 0;
      
      // Actualizar timestamp del último fetch exitoso
      lastFetchTimeRef.current = Date.now();
      
      // Calcular el intervalo para la próxima actualización
      // Intervalo más largo si no hay tareas
      const nextInterval = (!fetchedTasks || fetchedTasks.length === 0) ? 60000 : 30000;
      
      // Limpiar timeout anterior si existe
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Programar próxima actualización con un intervalo apropiado
      timeoutRef.current = setTimeout(() => {
        fetchTasks();
      }, nextInterval);
      
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      
      // Incrementar contador de reintentos
      retryCountRef.current += 1;
      
      // Mostrar error al usuario
      setError(error.response?.data?.message || 'Error al cargar tareas');
      
      // Si aún no hemos alcanzado el máximo de reintentos
      if (retryCountRef.current <= maxRetries) {
        // Calcular retraso exponencial (1s, 2s, 4s, ...)
        const retryDelay = Math.pow(2, retryCountRef.current - 1) * 1000;
        
        console.warn(`Reintentando en ${retryDelay/1000} segundos (intento ${retryCountRef.current}/${maxRetries})`);
        
        // Limpiar timeout anterior si existe
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Programar reintento
        timeoutRef.current = setTimeout(() => {
          fetchTasks(true);
        }, retryDelay);
      } else {
        // Si hemos agotado los reintentos, programar una actualización después de un tiempo más largo
        console.warn('Máximo de reintentos alcanzado. Próxima actualización en 2 minutos.');
        
        // Limpiar timeout anterior si existe
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Programar próxima actualización después de un tiempo más largo
        timeoutRef.current = setTimeout(() => {
          // Resetear contador de reintentos
          retryCountRef.current = 0;
          fetchTasks(true);
        }, 120000); // 2 minutos
      }
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, [isAuthenticated, statusFilter, searchTerm]);

  // Cargar tareas cuando cambian los filtros o la autenticación
  useEffect(() => {
    if (isAuthenticated) {
      // Limpiar timeout anterior si existe
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Resetear contador de reintentos
      retryCountRef.current = 0;
      
      // Forzar fetch cuando cambian los filtros
      fetchTasks(true);
    } else {
      setTasks([]);
      
      // Limpiar timeout al cerrar sesión
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
    
    // Limpiar al desmontar
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isAuthenticated, statusFilter, searchTerm, fetchTasks]);

  // Función para crear una nueva tarea
  const createTask = async (taskData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/tasks`, taskData);
      
      // Obtener la tarea creada
      const newTask = response.data.task || response.data;
      
      // Actualizar la lista de tareas
      setTasks(prevTasks => [newTask, ...prevTasks]);
      
      console.log("Tarea creada:", newTask);
      
      return newTask;
    } catch (error) {
      console.error('Error al crear tarea:', error);
      setError(error.response?.data?.message || 'Error al crear la tarea');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar una tarea
  const updateTask = async (taskId, taskData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put(`${API_URL}/tasks/${taskId}`, taskData);
      
      // Obtener la tarea actualizada
      const updatedTask = response.data.task || response.data;
      
      // Actualizar la lista de tareas
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? updatedTask : task
        )
      );
      
      console.log("Tarea actualizada:", updatedTask);
      
      return updatedTask;
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      setError(error.response?.data?.message || 'Error al actualizar la tarea');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para marcar una tarea como completada
  const completeTask = async (taskId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.patch(`${API_URL}/tasks/${taskId}/complete`);
      
      // Obtener la tarea completada
      const completedTask = response.data.task || response.data;
      
      // Actualizar la lista de tareas
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? completedTask : task
        )
      );
      
      console.log("Tarea completada:", completedTask);
      
      return completedTask;
    } catch (error) {
      console.error('Error al completar tarea:', error);
      setError(error.response?.data?.message || 'Error al completar la tarea');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar una tarea
  const deleteTask = async (taskId) => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`${API_URL}/tasks/${taskId}`);
      
      // Eliminar la tarea del estado
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      console.log("Tarea eliminada:", taskId);
      
      return true;
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      setError(error.response?.data?.message || 'Error al eliminar la tarea');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar el filtro de estado
  const filterByStatus = (status) => {
    setStatusFilter(status);
  };

  // Función para buscar tareas
  const searchTasks = (term) => {
    setSearchTerm(term);
  };

  // Función para refrescar manualmente
  const refreshTasks = () => {
    fetchTasks(true);
  };

  const value = {
    tasks,
    loading,
    error,
    statusFilter,
    searchTerm,
    taskCounters, // Agregar contadores al contexto
    fetchTasks,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    filterByStatus,
    searchTasks,
    refreshTasks,
    onFilterChange: filterByStatus // Alias para mantener compatibilidad
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export default TaskContext;