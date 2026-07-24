/**
 * controllers/paymentController.js
 * -----------------------------------------------------------------------
 * Módulo Pagos (Stripe).
 * -----------------------------------------------------------------------
 */

const User = require('../models/mysql/User');
const Itinerary = require('../models/mysql/Itinerary');
const SavedCard = require('../models/mysql/SavedCard');
const Transaction = require('../models/mysql/Transaction');
const stripeService = require('../services/stripeService');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Serializa una tarjeta guardada, sin exponer el providerPaymentMethodId completo.
 */
const toPublicCard = (card) => ({
  id: card.id,
  brand: card.brand,
  last4: card.last4,
  expMonth: card.expMonth,
  expYear: card.expYear,
  isDefault: card.isDefault,
});

/**
 * POST /payments/intent
 * Crea un PaymentIntent y devuelve el client_secret al frontend.
 */
const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency, itineraryId, description } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) throw new AppError('Usuario no encontrado.', 404);

    if (itineraryId) {
      const itinerary = await Itinerary.findOne({ where: { id: itineraryId, userId: user.id } });
      if (!itinerary) throw new AppError('Itinerario no encontrado.', 404);
    }

    let paymentIntent;
    try {
      paymentIntent = await stripeService.createPaymentIntent({
        user,
        amount,
        currency: currency || undefined,
        description,
        metadata: itineraryId ? { itineraryId: String(itineraryId) } : {},
      });
    } catch (stripeError) {
      logger.error(`Error creando PaymentIntent en Stripe: ${stripeError.message}`);
      throw new AppError('No se pudo iniciar el pago en este momento.', 503);
    }

    await Transaction.create({
      userId: user.id,
      itineraryId: itineraryId || null,
      providerPaymentIntentId: paymentIntent.id,
      amount,
      currency: (currency || 'mxn').toLowerCase(),
      status: 'pending',
      description,
    });

    return ApiResponse.success(res, 201, 'Pago iniciado.', {
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /payments/setup-intent
 * Permite guardar una tarjeta sin cobrar todavía.
 */
const createSetupIntent = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) throw new AppError('Usuario no encontrado.', 404);

    let setupIntent;
    try {
      setupIntent = await stripeService.createSetupIntent({ user });
    } catch (stripeError) {
      logger.error(`Error creando SetupIntent en Stripe: ${stripeError.message}`);
      throw new AppError('No se pudo iniciar el guardado de la tarjeta en este momento.', 503);
    }

    return ApiResponse.success(res, 201, 'Guardado de tarjeta iniciado.', {
      clientSecret: setupIntent.client_secret,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /payments/history
 * Lista las transacciones del usuario autenticado.
 */
const getHistory = async (req, res, next) => {
  try {
    const transactions = await Transaction.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    return ApiResponse.success(res, 200, 'Historial de pagos obtenido.', { transactions });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /payments/cards
 * Lista las tarjetas guardadas del usuario autenticado (sin datos sensibles).
 */
const getCards = async (req, res, next) => {
  try {
    const cards = await SavedCard.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    return ApiResponse.success(res, 200, 'Tarjetas guardadas obtenidas.', {
      cards: cards.map(toPublicCard),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /payments/webhook
 * Endpoint público (sin JWT) que recibe eventos de Stripe. Requiere el
 * body crudo (ver app.js: express.raw() montado antes del JSON parser
 * global, solo para esta ruta) porque la verificación de firma necesita
 * los bytes exactos enviados por Stripe.
 */
const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'];

    let event;
    try {
      event = stripeService.constructWebhookEvent(req.body, signature);
    } catch (verificationError) {
      logger.warn(`Firma de webhook de Stripe inválida: ${verificationError.message}`);
      throw new AppError('Firma de webhook inválida.', 400);
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object;
        await Transaction.update(
          { status: 'succeeded' },
          { where: { providerPaymentIntentId: intent.id } }
        );
        break;
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object;
        await Transaction.update(
          { status: 'failed' },
          { where: { providerPaymentIntentId: intent.id } }
        );
        break;
      }

      case 'payment_intent.canceled': {
        const intent = event.data.object;
        await Transaction.update(
          { status: 'canceled' },
          { where: { providerPaymentIntentId: intent.id } }
        );
        break;
      }

      case 'setup_intent.succeeded': {
        const setupIntent = event.data.object;
        const userId = setupIntent.metadata && setupIntent.metadata.userId;
        const paymentMethodId = setupIntent.payment_method;

        if (userId && paymentMethodId) {
          const paymentMethod = await stripeService.retrievePaymentMethod(paymentMethodId);
          const cardInfo = paymentMethod.card || {};

          await SavedCard.findOrCreate({
            where: { providerPaymentMethodId: paymentMethodId },
            defaults: {
              userId: Number(userId),
              brand: cardInfo.brand || null,
              last4: cardInfo.last4 || null,
              expMonth: cardInfo.exp_month || null,
              expYear: cardInfo.exp_year || null,
            },
          });
        }
        break;
      }

      default:
        // Eventos no manejados explícitamente se ignoran de forma segura.
        break;
    }

    // Stripe espera un 200 rápido; el formato exacto del body no es relevante para Stripe,
    // pero mantenemos el contrato estándar de la API para el resto de consumidores internos.
    return ApiResponse.success(res, 200, 'Evento procesado.');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createPaymentIntent,
  createSetupIntent,
  getHistory,
  getCards,
  handleWebhook,
};
