'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;

console.log('🔧 Configurando Sequelize...');
console.log('📍 Ambiente:', env);
console.log('📋 Configuración:', JSON.stringify(config, null, 2));

if (config.use_env_variable) {
  // Usar variable de entorno (DATABASE_URL)
  const databaseUrl = process.env[config.use_env_variable];
  
  if (!databaseUrl) {
    console.error(`❌ Variable de entorno ${config.use_env_variable} no encontrada`);
    process.exit(1);
  }
  
  console.log('🔗 Conectando usando variable de entorno:', config.use_env_variable);
  console.log('🔗 DATABASE_URL:', databaseUrl);
  
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: env === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
  
} else {
  // Usar configuración directa
  console.log('🔗 Conectando usando configuración directa');
  console.log('📍 Host:', config.host);
  console.log('📍 Database:', config.database);
  
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Cargar modelos
console.log('📂 Cargando modelos...');
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    console.log('📋 Cargando modelo:', file);
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

console.log('🔗 Modelos cargados:', Object.keys(db));

// Asociar modelos
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    console.log('🔗 Configurando asociaciones para:', modelName);
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;