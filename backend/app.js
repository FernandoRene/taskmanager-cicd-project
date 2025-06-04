var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
//var logger = require('morgan');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Importar los modelos para sincronizar la base de datos
const db = require('./models');

var userRoutes = require('./routes/user.routes');
var taskRoutes = require('./routes/task.routes');

var app = express();

// Middlewares
app.use(cors()); // Habilitar CORS para la conexión con el frontend
app.use(express.json()); // Parsear solicitudes con JSON
app.use(express.urlencoded({ extended: true })); // Parsear solicitudes con formularios
app.use(morgan('dev')); // Logging en desarrollo

// Sincronizar los modelos con la base de datos en un orden específico
const syncDatabase = async () => {
  console.log('Modelos disponibles:', Object.keys(db));
  try {
    // Primero sincronizar el modelo User
    if (db.User) {
      await db.User.sync({ force: false });
      console.log('Tabla User sincronizada correctamente');
    } else {
      console.error('El modelo User no está definido correctamente');
    }
    
    // Luego sincronizar el modelo Task (y cualquier otro modelo dependiente)
    if (db.Task) {
      await db.Task.sync({ force: false });
      console.log('Tabla Task sincronizada correctamente');
    } else {
      console.error('El modelo Task no está definido correctamente');
    }
    
    // Finalmente, sincronizar cualquier otro modelo restante
    console.log('Base de datos sincronizada correctamente');
  } catch (err) {
    console.error('Error sincronizando la base de datos:', err);
  }
};

// Ejecutar la sincronización secuencial
syncDatabase();

app.use('/api', userRoutes);
app.use('/api', taskRoutes);

// Ruta para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.json({ message: 'API de Gestor de Tareas funcionando' });
});

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Error en el servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

module.exports = app;