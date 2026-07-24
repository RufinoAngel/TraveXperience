/**
 * routes/paymentRoutes.js
 * -----------------------------------------------------------------------
 * Módulo Pagos (Stripe).
 * IMPORTANTE: la ruta /webhook es pública (sin `protect`) y depende de
 * que app.js monte express.raw() para /api/v1/payments/webhook ANTES del
 * express.json() global — Stripe necesita el body crudo para validar la
 * firma. Ver comentario en src/app.js.
 * -----------------------------------------------------------------------
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const paymentController = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');

router.post(
  '/intent',
  protect,
  [
    body('amount').isFloat({ gt: 0 }).withMessage('El monto debe ser mayor a 0.'),
    body('currency').optional().isString().isLength({ min: 3, max: 3 }).withMessage('Moneda inválida.'),
    body('itineraryId').optional().isInt({ min: 1 }).withMessage('itineraryId inválido.'),
    body('description').optional().isString().isLength({ max: 300 }),
  ],
  validateRequest,
  paymentController.createPaymentIntent
);

router.post('/setup-intent', protect, paymentController.createSetupIntent);

router.get('/history', protect, paymentController.getHistory);

router.get('/cards', protect, paymentController.getCards);

// Público: Stripe llama a esta ruta directamente, sin JWT. La verificación
// de autenticidad se hace mediante la firma del header 'stripe-signature'.
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
