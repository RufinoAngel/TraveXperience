/**
 * routes/authRoutes.js
 * -----------------------------------------------------------------------
 * Módulo 1: Autenticación y Perfiles.
 * Núcleo compartido por Web, App Móvil y Smartwatch (login único con JWT).
 * -----------------------------------------------------------------------
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { upload } = require('../utils/upload');

router.post(
  '/register',
  [
    body('fullName').trim().notEmpty().withMessage('El nombre completo es obligatorio.'),
    body('email').isEmail().withMessage('Correo electrónico inválido.').normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres.'),
    body('role').optional().isIn(['usuario', 'administrador']).withMessage('Rol inválido.'),
    body('companyName').optional().trim(),
    body('phone').optional({ nullable: true }).trim().isLength({ max: 20 }),
    body('location').optional({ nullable: true }).trim().isLength({ max: 150 }),
  ],
  validateRequest,
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Correo electrónico inválido.').normalizeEmail(),
    body('password').notEmpty().withMessage('La contraseña es obligatoria.'),
  ],
  validateRequest,
  authController.login
);

router.post(
  '/google',
  [body('idToken').notEmpty().withMessage('Se requiere el idToken de Google.')],
  validateRequest,
  authController.googleAuth
);

router.post(
  '/refresh-token',
  [body('refreshToken').notEmpty().withMessage('Se requiere el refreshToken.')],
  validateRequest,
  authController.refreshToken
);

router.post('/logout', protect, authController.logout);

router.get('/me', protect, authController.getMe);

router.put(
  '/profile',
  protect,
  upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'photos', maxCount: 10 },
  ]),
  [
    body('fullName').optional().trim().notEmpty().withMessage('El nombre no puede quedar vacío.'),
    body('phone').optional({ nullable: true }).trim().isLength({ max: 20 }),
    body('location').optional({ nullable: true }).trim().isLength({ max: 150 }),
    body('bio').optional({ nullable: true }).trim().isLength({ max: 300 }),
  ],
  validateRequest,
  authController.updateProfile
);

router.post('/profile/photo', protect, upload.single('profilePhoto'), authController.updateProfile);
router.post('/profile/photos', protect, upload.array('photos', 10), authController.updateProfile);

// Foto de perfil ("avatar"): multipart/form-data, campo "avatar".
router.put('/profile/avatar', protect, upload.single('avatar'), authController.updateAvatar);

router.put(
  '/preferences',
  protect,
  [body().isObject().withMessage('El cuerpo debe ser un objeto de preferencias.')],
  validateRequest,
  authController.updatePreferences
);

router.put(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('La contraseña actual es obligatoria.'),
    body('newPassword').isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres.'),
  ],
  validateRequest,
  authController.changePassword
);

router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Correo electrónico inválido.').normalizeEmail()],
  validateRequest,
  authController.forgotPassword
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token de recuperación requerido.'),
    body('newPassword').isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres.'),
  ],
  validateRequest,
  authController.resetPassword
);

module.exports = router;
