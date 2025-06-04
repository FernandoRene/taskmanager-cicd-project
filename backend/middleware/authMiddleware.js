const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Obtener la clave secreta desde variables de entorno
const SECRET_KEY = process.env.SECRET_KEY || 'secret-key-task-manager';

/**
 * Middleware para proteger rutas que requieren autenticación
 * Verifica el token JWT y adjunta el usuario a la solicitud
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Verificar si hay un header de autorización
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado. Token no proporcionado' });
    }
    
    // Obtener el token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No autorizado. Token no proporcionado' });
    }
    
    try {
      // Verificar y decodificar el token
      const decoded = jwt.verify(token, SECRET_KEY);
      
      // Buscar el usuario en la base de datos
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] } // Excluir la contraseña por seguridad
      });
      
      if (!user) {
        return res.status(401).json({ message: 'Usuario no encontrado o token inválido' });
      }
      
      // Adjuntar el usuario a la solicitud para usarlo en rutas protegidas
      req.user = user;
      
      // Continuar con la siguiente función middleware
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Sesión expirada. Inicie sesión nuevamente' });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token inválido' });
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

module.exports = authMiddleware;