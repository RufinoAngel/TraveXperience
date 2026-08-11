/**
 * routes/aiRoutes.js
 * -----------------------------------------------------------------------
 * Endpoints de Inteligencia Artificial: tipo de viajero y presupuesto
 * estimado. Ambos requieren sesión (mismo patrón que el resto del API).
 * -----------------------------------------------------------------------
 */

const express = require('express');
const { query } = require('express-validator');
const router = express.Router();

const aiController = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');

router.use(protect);

router.get('/traveler-type', aiController.getTravelerType);

router.get(
  '/budget-estimate',
  [
    query('startDate').isISO8601().withMessage('startDate debe ser una fecha válida (YYYY-MM-DD).'),
    query('endDate').isISO8601().withMessage('endDate debe ser una fecha válida (YYYY-MM-DD).'),
    query('numActivities').optional().isInt({ min: 0 }).withMessage('numActivities debe ser un entero >= 0.'),
  ],
  validateRequest,
  aiController.getBudgetEstimate
);

module.exports = router;
