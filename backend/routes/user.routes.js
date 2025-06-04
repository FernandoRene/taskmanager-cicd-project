const express = require('express');
const router = express.Router();

//const { register, login,getMe,listUsers } = require('../controllers/user.controller');

const authController = require('../controllers/user.controller');

// Middlewares
const authMiddleware = require('../middleware/authMiddleware');
const {registerValidations,  loginValidations} = require('../middleware/validationMiddleware');

// Rutas de autenticación de usuario
router.post('/auth/register', registerValidations, authController.register);
router.post('/auth/login', loginValidations, authController.login);
router.get('/auth/me', authMiddleware, authController.getMe);
router.get('/user/listUsers',authController.listUsers);

module.exports = router;