/**
 * services/stripeService.js
 * -----------------------------------------------------------------------
 * Encapsula toda la interacción con el SDK de Stripe: creación de
 * PaymentIntents (cobros) y SetupIntents (guardar tarjetas sin cobrar),
 * gestión del Customer asociado a cada User, y verificación de la firma
 * de los webhooks.
 * -----------------------------------------------------------------------
 */

const Stripe = require('stripe');

let stripeClient = null;

/**
 * Cliente Stripe perezoso: evita romper el arranque del servidor si la
 * env var aún no está configurada en un entorno de desarrollo temprano.
 */
const getClient = () => {
  if (stripeClient) return stripeClient;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY no está configurada.');
  }

  stripeClient = new Stripe(secretKey, { apiVersion: '2024-06-20' });
  return stripeClient;
};

/**
 * Obtiene (o crea) el Customer de Stripe asociado a un usuario y persiste
 * el id en User.stripeCustomerId para reutilizarlo en el futuro.
 * @param {import('../models/mysql/User')} user - instancia Sequelize de User
 */
const getOrCreateCustomer = async (user) => {
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const stripe = getClient();
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.fullName,
    metadata: { userId: String(user.id) },
  });

  user.stripeCustomerId = customer.id;
  await user.save();

  return customer.id;
};

/**
 * Crea un PaymentIntent para cobrar al usuario.
 * @param {{user: object, amount: number, currency?: string, description?: string, metadata?: object}} params
 */
const createPaymentIntent = async ({ user, amount, currency = 'mxn', description, metadata = {} }) => {
  const stripe = getClient();
  const customerId = await getOrCreateCustomer(user);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(Number(amount) * 100), // Stripe trabaja en centavos
    currency,
    customer: customerId,
    description,
    automatic_payment_methods: { enabled: true },
    metadata: { userId: String(user.id), ...metadata },
  });

  return paymentIntent;
};

/**
 * Crea un SetupIntent para guardar una tarjeta sin cobrar todavía.
 * @param {{user: object}} params
 */
const createSetupIntent = async ({ user }) => {
  const stripe = getClient();
  const customerId = await getOrCreateCustomer(user);

  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ['card'],
    metadata: { userId: String(user.id) },
  });

  return setupIntent;
};

/**
 * Verifica la firma de un evento de webhook y devuelve el evento ya
 * validado. rawBody debe ser el Buffer crudo del request (sin parsear).
 * @param {Buffer} rawBody
 * @param {string} signature - header 'stripe-signature'
 */
const constructWebhookEvent = (rawBody, signature) => {
  const stripe = getClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET no está configurada.');
  }
  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
};

/**
 * Recupera un PaymentMethod completo desde Stripe (usado tras un
 * setup_intent.succeeded para extraer brand/last4/expiry).
 * @param {string} paymentMethodId
 */
const retrievePaymentMethod = async (paymentMethodId) => {
  const stripe = getClient();
  return stripe.paymentMethods.retrieve(paymentMethodId);
};

module.exports = {
  getOrCreateCustomer,
  createPaymentIntent,
  createSetupIntent,
  constructWebhookEvent,
  retrievePaymentMethod,
};
