/**
 * controllers/aiController.js
 * -----------------------------------------------------------------------
 * Expone vía API los modelos de IA ya cargados en aiService.js:
 *   - GET /ai/traveler-type   -> clasifica al usuario autenticado en uno
 *                                 de los 4 clusters de viajero (K-Means + NN).
 *   - GET /ai/budget-estimate -> corre el modelo de regresión de
 *                                 presupuesto de forma independiente de la
 *                                 creación de un itinerario.
 * Sigue el mismo patrón que el resto de los controladores: JWT vía
 * middlewares/authMiddleware, respuestas con utils/apiResponse, errores
 * operacionales con utils/AppError (los captura middlewares/errorHandler).
 * -----------------------------------------------------------------------
 */

const { Op } = require('sequelize');

const User = require('../models/mysql/User');
const Itinerary = require('../models/mysql/Itinerary');
const aiService = require('../services/aiService');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');
const { getClusterLabel } = require('../config/travelerClusters');

/**
 * Presupuesto promedio del usuario:
 *   1. Si ya lo tiene guardado en travelPreferences.avgBudget, se usa ese.
 *   2. Si no, se calcula como el promedio de estimatedBudget de sus
 *      propios itinerarios (los que sí tienen presupuesto).
 *   3. Si tampoco hay eso, se devuelve null (el caller decide qué hacer).
 */
const resolveUserAvgBudget = async (user) => {
  const fromPreferences = Number(user.travelPreferences?.avgBudget);
  if (Number.isFinite(fromPreferences) && fromPreferences > 0) {
    return { avgBudget: fromPreferences, source: 'travelPreferences.avgBudget' };
  }

  const itineraries = await Itinerary.findAll({
    where: { userId: user.id, estimatedBudget: { [Op.ne]: null } },
    attributes: ['estimatedBudget'],
    raw: true,
  });

  if (itineraries.length === 0) {
    return { avgBudget: null, source: null };
  }

  const total = itineraries.reduce((sum, it) => sum + Number(it.estimatedBudget || 0), 0);
  return { avgBudget: total / itineraries.length, source: 'promedio de itinerarios propios' };
};

/**
 * Normaliza [budgetAverage, age] dividiendo entre el máximo observado en
 * la base actual de usuarios (misma convención "dividir entre el máximo
 * del batch" que ya usa scripts/trainBudgetModel.js).
 *
 * ⚠️ Ver src/config/travelerClusters.js y el reporte de entrega: el
 * modelo de clustering fue entrenado con una normalización cuyos
 * parámetros exactos no quedaron persistidos en este repositorio (la
 * función Simulation/generate_synthetic_users.js#toFeatureVector no está
 * incluida). Esta función es la mejor aproximación posible sin inventar
 * constantes: calcula los máximos sobre datos reales y actuales de la
 * tabla `users`, igual que haría un reentrenamiento hoy mismo.
 */
const computeClusteringBounds = async () => {
  const users = await User.findAll({ raw: true, attributes: ['travelPreferences'] });

  let maxAge = 0;
  let maxBudget = 0;
  users.forEach((u) => {
    const prefs = u.travelPreferences || {};
    const age = Number(prefs.age);
    const budget = Number(prefs.avgBudget);
    if (Number.isFinite(age) && age > maxAge) maxAge = age;
    if (Number.isFinite(budget) && budget > maxBudget) maxBudget = budget;
  });

  return { maxAge, maxBudget };
};

/**
 * GET /ai/traveler-type
 * Devuelve el tipo de viajero (cluster) del usuario autenticado.
 */
const getTravelerType = async (req, res, next) => {
  try {
    if (!aiService.isClusteringReady()) {
      throw new AppError(
        'El servicio de clasificación de tipo de viajero no está disponible en este momento.',
        503
      );
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      throw new AppError('Usuario no encontrado.', 404);
    }

    const prefs = user.travelPreferences || {};

    const missing = [];
    if (prefs.age === undefined || prefs.age === null || !Number.isFinite(Number(prefs.age))) {
      missing.push('age');
    }
    if (prefs.interesAventura === undefined || prefs.interesAventura === null) {
      missing.push('interesAventura');
    }
    if (prefs.interesCultura === undefined || prefs.interesCultura === null) {
      missing.push('interesCultura');
    }
    if (prefs.viajaSolo === undefined || prefs.viajaSolo === null) {
      missing.push('viajaSolo');
    }

    const { avgBudget, source: avgBudgetSource } = await resolveUserAvgBudget(user);
    if (avgBudget === null) {
      missing.push('avgBudget');
    }

    if (missing.length > 0) {
      throw new AppError(
        'Faltan datos para calcular tu tipo de viajero. Completa tus preferencias de viaje (PUT /auth/preferences) y ten al menos un itinerario con presupuesto, o registra un presupuesto promedio.',
        422,
        { missingFields: missing }
      );
    }

    const { maxAge, maxBudget } = await computeClusteringBounds();

    const features = [
      maxBudget > 0 ? avgBudget / maxBudget : 0,
      maxAge > 0 ? Number(prefs.age) / maxAge : 0,
      prefs.interesAventura ? 1 : 0,
      prefs.interesCultura ? 1 : 0,
      prefs.viajaSolo ? 1 : 0,
    ];

    if (features.some((v) => !Number.isFinite(v))) {
      throw new AppError('No se pudieron construir características válidas para el modelo.', 422);
    }

    let probabilities;
    try {
      probabilities = await aiService.predictTravelerCluster(features);
    } catch (aiError) {
      logger.error(`Error de TensorFlow al predecir tipo de viajero (userId=${user.id}): ${aiError.message}`);
      throw new AppError('No se pudo calcular tu tipo de viajero en este momento.', 500);
    }

    const cluster = probabilities.indexOf(Math.max(...probabilities));
    const travelerType = getClusterLabel(cluster);

    return ApiResponse.success(res, 200, 'Tipo de viajero calculado.', {
      cluster,
      travelerType,
      probabilities,
      featuresUsed: {
        avgBudget,
        avgBudgetSource,
        age: Number(prefs.age),
        adventureInterest: Boolean(prefs.interesAventura),
        cultureInterest: Boolean(prefs.interesCultura),
        soloTravelPreference: Boolean(prefs.viajaSolo),
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /ai/budget-estimate?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&numActivities=3
 * Corre el modelo de predicción de presupuesto de forma independiente
 * (sin necesidad de crear un itinerario), reutilizando exactamente la
 * misma lógica/normalización que itineraryController.createItinerary.
 */
const getBudgetEstimate = async (req, res, next) => {
  try {
    if (!aiService.isReady()) {
      throw new AppError('El servicio de predicción de presupuesto no está disponible en este momento.', 503);
    }

    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      throw new AppError('Se requieren los parámetros "startDate" y "endDate" (YYYY-MM-DD).', 422);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new AppError('startDate/endDate deben ser fechas válidas (YYYY-MM-DD).', 422);
    }
    if (end < start) {
      throw new AppError('La fecha de fin no puede ser anterior a la fecha de inicio.', 422);
    }

    const numActivities = Number(req.query.numActivities) || 0;
    if (numActivities < 0) {
      throw new AppError('"numActivities" no puede ser negativo.', 422);
    }

    const durationDays = (end - start) / (1000 * 60 * 60 * 24) + 1;

    let estimatedBudget;
    try {
      estimatedBudget = await aiService.predictBudget([durationDays, numActivities]);
    } catch (aiError) {
      logger.error(`Error de TensorFlow al predecir presupuesto: ${aiError.message}`);
      throw new AppError('No se pudo estimar el presupuesto en este momento.', 500);
    }

    return ApiResponse.success(res, 200, 'Presupuesto estimado.', {
      estimatedBudget,
      durationDays,
      numActivities,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getTravelerType, getBudgetEstimate };
