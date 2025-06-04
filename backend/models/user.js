'use strict';
const bcrypt = require('bcryptjs');
const {
  Model
} = require('sequelize');
const { tableName } = require('sequelize/lib/model');
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    name: {
      type: DataTypes.STRING,
      allowNull: false, // No permite valores nulos
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false, // No permite valores nulos
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false, // No permite valores nulos
      validate: {
        len: [6, 100] // Mínimo 6 caracteres
      }
    }
  },
    {
      tableName: 'users'  // Nombre de la tabla usuarios en la base de datos
    });

  User.associate = (models) => {
    User.hasMany(models.Task, { foreignKey: "userId" });
  };

  // Hook para hashear la contraseña antes de crear un usuario
  User.beforeCreate(async (user) => {
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  // Hook para hashear la contraseña antes de actualizar un usuario (si se cambia la contraseña)
  User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  // Método para comparar contraseñas (útil para el login)
  User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };


  return User;
};