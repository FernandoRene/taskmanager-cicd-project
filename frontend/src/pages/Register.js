import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, error } = useAuth();
  const navigate = useNavigate();

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
    
    if (!formData.name.trim()) {
      errors.name = 'El nombre es obligatorio';
    }
    
    if (!formData.email) {
      errors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }
    
    if (!formData.password) {
      errors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Eliminar confirmPassword antes de enviar al API
        const { confirmPassword, ...userData } = formData;
        await register(userData);
        navigate('/dashboard');
      } catch (error) {
        console.error('Error de registro:', error);
        // Los errores de API se manejan en el contexto de autenticación
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Registro de Usuario</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Nombre
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={`form-input ${formErrors.name ? 'error' : ''}`}
              placeholder="Tu nombre"
              value={formData.name}
              onChange={handleChange}
            />
            {formErrors.name && (
              <p className="form-error">{formErrors.name}</p>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-input ${formErrors.email ? 'error' : ''}`}
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
            />
            {formErrors.email && (
              <p className="form-error">{formErrors.email}</p>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={`form-input ${formErrors.password ? 'error' : ''}`}
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
            />
            {formErrors.password && (
              <p className="form-error">{formErrors.password}</p>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className={`form-input ${formErrors.confirmPassword ? 'error' : ''}`}
              placeholder="********"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {formErrors.confirmPassword && (
              <p className="form-error">{formErrors.confirmPassword}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registrando...' : 'Registrarse'}
          </button>
          
          <div className="auth-footer">
            <p>
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="auth-link">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;