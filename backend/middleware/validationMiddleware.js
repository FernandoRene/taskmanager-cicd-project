const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware para validar los resultados de las validaciones
 */
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * Validaciones para el registro de usuario
 */
const registerValidations = [
  body('name')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isString().withMessage('El nombre debe ser texto')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),

  body('email')
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Debe proporcionar un email válido'),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),

  validateResults
];

/**
 * Validaciones para el inicio de sesión
 */
const loginValidations = [
  body('email')
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Debe proporcionar un email válido'),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria'),

  validateResults
];

/**
 * Validaciones para crear una tarea
 */
const createTaskValidations = [
  body('title')
    .notEmpty().withMessage('El título es obligatorio')
    .isString().withMessage('El título debe ser texto'),

  body('description')
    .optional()
    .isString().withMessage('La descripción debe ser texto'),

  body('dueDate')
    .optional()
    .custom((value) => {
      if (value === null) {
        return true; // Aceptar null como valor válido
      }
      if (!value) {
        return true; // Aceptar undefined y "" como valor válido
      }
      return body('dueDate').isISO8601().run({ req: { body: { dueDate: value } } });
    })
    .withMessage('La fecha límite debe ser una fecha válida'),

  validateResults
];

/**
 * Validaciones para actualizar una tarea
 */
const updateTaskValidations = [
  param('id')
    .isNumeric().withMessage('El ID de la tarea debe ser numérico'),

  body('title')
    .optional()
    .isString().withMessage('El título debe ser texto'),

  body('description')
    .optional()
    .isString().withMessage('La descripción debe ser texto'),

  body('status')
    .optional()
    .isIn(['pendiente', 'en progreso', 'completada']).withMessage('El estado debe ser pendiente, en progreso o completada'),

  body('dueDate')
    .optional()
    .isISO8601().withMessage('La fecha límite debe ser una fecha válida'),

  validateResults
];

/**
 * Validaciones para id de tarea en parámetros
 */
const taskIdValidation = [
  param('id')
    .isNumeric().withMessage('El ID de la tarea debe ser numérico'),

  validateResults
];

/**
 * Validaciones para filtros de tareas
 */
const taskFilterValidations = [
  query('status')
    .optional()
    .isIn(['pendiente', 'en progreso', 'completada']).withMessage('El estado debe ser pendiente, en progreso o completada'),

  query('search')
    .optional()
    .isString().withMessage('El término de búsqueda debe ser texto'),

  validateResults
];

module.exports = {
  registerValidations,
  loginValidations,
  createTaskValidations,
  updateTaskValidations,
  taskIdValidation,
  taskFilterValidations
};