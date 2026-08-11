/**
 * routes/adminRoutes.js
 * -----------------------------------------------------------------------
 * Panel de Administración: Dashboard, Configuraciones, Finanzas,
 * Transacciones, Métodos de pago, Actividad y Alertas.
 * Todas las rutas requieren sesión y rol "administrador".
 * -----------------------------------------------------------------------
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const PaymentMethod = require('../models/mongodb/PaymentMethod');

router.use(protect, authorize('administrador'));

// --- Dashboard -------------------------------------------------------------
router.get('/dashboard', adminController.getDashboard);

// --- Configuraciones ---------------------------------------------------------
router.get('/settings', adminController.getSettings);

router.put(
  '/settings',
  [
    body('platformName').optional().trim().isLength({ min: 1, max: 150 }),
    body('supportEmail').optional().isEmail().withMessage('Correo de soporte inválido.'),
    body('currency').optional().trim().isLength({ min: 3, max: 3 }),
    body('language').optional().trim().isLength({ min: 2, max: 5 }),
    body('bookingCommissionPct').optional().isFloat({ min: 0, max: 100 }),
    body('refundWindowDays').optional().isInt({ min: 0 }),
    body('autoApprovePartners').optional().isBoolean(),
    body('emailNotifications').optional().isBoolean(),
    body('smsNotifications').optional().isBoolean(),
    body('twoFactorAuth').optional().isBoolean(),
    body('maintenanceMode').optional().isBoolean(),
  ],
  validateRequest,
  adminController.updateSettings
);

// --- Finanzas ----------------------------------------------------------------
router.get(
  '/finances',
  [query('months').optional().isInt({ min: 1, max: 24 })],
  validateRequest,
  adminController.getFinances
);

router.get(
  '/transactions',
  [
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('startDate').optional().isISO8601().withMessage('startDate debe ser una fecha válida.'),
    query('endDate').optional().isISO8601().withMessage('endDate debe ser una fecha válida.'),
    query('category').optional().isString(),
    query('status').optional().isIn(['pending', 'succeeded', 'failed', 'canceled', 'refunded']),
  ],
  validateRequest,
  adminController.getTransactions
);

// --- Métodos de pago -----------------------------------------------------------
router.get('/payment-methods', adminController.listPaymentMethods);

router.post(
  '/payment-methods',
  [
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio.'),
    body('type').isIn(PaymentMethod.TYPES).withMessage('Tipo de método de pago inválido.'),
    body('provider').optional().isString(),
    body('description').optional().isString().isLength({ max: 300 }),
    body('isActive').optional().isBoolean(),
  ],
  validateRequest,
  adminController.createPaymentMethod
);

router.delete(
  '/payment-methods/:id',
  [param('id').isMongoId().withMessage('Identificador de método de pago inválido.')],
  validateRequest,
  adminController.deletePaymentMethod
);

// --- Actividad y alertas -------------------------------------------------------
router.get(
  '/activity',
  [query('limit').optional().isInt({ min: 1, max: 100 })],
  validateRequest,
  adminController.getActivity
);

router.get('/alerts', adminController.getAlerts);

// --- Estadísticas --------------------------------------------------------------
router.get(
  '/statistics',
  [query('months').optional().isInt({ min: 1, max: 24 })],
  validateRequest,
  adminController.getStatistics
);

module.exports = router;
