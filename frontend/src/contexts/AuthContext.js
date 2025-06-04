import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

// URL base de la API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';


console.log("REACT_APP_API_URL:", process.env.REACT_APP_API_URL);
console.log("API_URL completo:", API_URL);

// Crear el contexto de autenticación
export const AuthContext = createContext();

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Configurar interceptor para incluir el token en todas las peticiones
  useEffect(() => {
    const token = Cookies.get('token');
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    // Interceptor para manejar errores de autenticación
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // Verificar si el usuario está autenticado al cargar la aplicación
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = Cookies.get('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Configurar el token en los headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Obtener datos del usuario autenticado
        const response = await axios.get(`${API_URL}/auth/me`);
        setUser(response.data.user);
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        // Si hay error, limpiar las cookies
        Cookies.remove('token');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Función para registrar un nuevo usuario
  const register = async (userData) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      const { token, user } = response.data;
      
      // Guardar token en cookie (expira en 1 día)
      Cookies.set('token', token, { expires: 1, secure: process.env.NODE_ENV === 'production' });
      
      // Configurar token en headers para futuras peticiones
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      return user;
    } catch (error) {
      setError(error.response?.data?.message || 'Error al registrar usuario');
      throw error;
    }
  };

  // Función para iniciar sesión
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      const { token, user } = response.data;
      
      // Guardar token en cookie (expira en 1 día)
      Cookies.set('token', token, { expires: 1, secure: process.env.NODE_ENV === 'production' });
      
      // Configurar token en headers para futuras peticiones
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      return user;
    } catch (error) {
      setError(error.response?.data?.message || 'Credenciales incorrectas');
      throw error;
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    // Eliminar cookie
    Cookies.remove('token');
    
    // Eliminar token de los headers
    delete axios.defaults.headers.common['Authorization'];
    
    // Limpiar estado de usuario
    setUser(null);
    
    // Redireccionar a la página de login
    navigate('/login');
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};