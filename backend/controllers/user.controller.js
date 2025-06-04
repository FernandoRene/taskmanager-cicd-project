const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.listUsers = async (req, res) => {
    try {
        // Busca todos los usuarios en la BD
        const user = await User.findAll();

        // Verificar si hay usuarios
        if (user.length === 0 || user === null) {// Si no hay usuarios, devuelve un mensaje
            return res.status(404).json({
                message: "No se encontraron usuarios en la base de datos",
            });
        }

        // Devuelve la lista de clientes en formato JSON
        res.json(user);
    } catch (error) {
        // Manejo de errores
        console.error("Error al obtener los clientes:", error);
        res.status(400).json({ error: error.message });
    }
};


// Obtenemos la clave secreta para JWT desde las variables de entorno
const SECRET_KEY = process.env.SECRET_KEY;

// Registro de nuevo usuario
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar si el correo ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Este correo electrónico ya está registrado' });
    }

    // Crear nuevo usuario
    const user = await User.create({
      name,
      email,
      password // El hasheo se hace en el hook beforeCreate del modelo
    });

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      SECRET_KEY,
      { expiresIn: process.env.TOKEN_EXPIRATION } // teimpo de expiracion del token traido desde el archivo .env
    );

    // Responder excluyendo la contraseña
    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      SECRET_KEY,
      { expiresIn: process.env.TOKEN_EXPIRATION } // teimpo de expiracion del token traido desde el archivo .env
    );

    // Responder excluyendo la contraseña
    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    return res.json({
      message: 'Login exitoso',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Obtener datos del usuario actual
exports.getMe = async (req, res) => {
  try {
    // El middleware auth ya adjuntó el usuario a req.user
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] } // Excluir el campo de contraseña
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};