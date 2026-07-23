/**
 * controllers/itineraryController.js
 * -----------------------------------------------------------------------
 * Módulo 3: Turismo Foráneo ("Fuera de Casa") — Plataforma Web.
 * CRUD completo de itinerarios: "armado del itinerario completo del viaje,
 * día por día", con presupuesto estimado que puede alimentarse del modelo
 * de predicción de presupuesto (TensorFlow.js) vía aiService.
 * -----------------------------------------------------------------------
 */

const Itinerary = require('../models/mysql/Itinerary');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');
const aiService = require('../services/aiService');
const logger = require('../utils/logger');

/**
 * Verifica que el itinerario exista y pertenezca al usuario autenticado
 * (o que el usuario tenga rol "administrador").
 */
const findOwnedItinerary = async (id, user) => {
  const itinerary = await Itinerary.findByPk(id);
  if (!itinerary) {
    throw new AppError('Itinerario no encontrado.', 404);
  }
  if (itinerary.userId !== user.id && user.role !== 'administrador') {
    throw new AppError('No tienes permiso para modificar este itinerario.', 403);
  }
  return itinerary;
};

/**
 * GET /itineraries
 * Lista los itinerarios del usuario autenticado, con paginación simple.
 */
const listItineraries = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const pageSize = Math.min(Number(req.query.pageSize) || 10, 50);

    const { rows, count } = await Itinerary.findAndCountAll({
      where: { userId: req.user.id },
      order: [['startDate', 'ASC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    return ApiResponse.success(res, 200, 'Itinerarios obtenidos.', {
      total: count,
      page,
      pageSize,
      itineraries: rows,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /itineraries/:id
 */
const getItinerary = async (req, res, next) => {
  try {
    const itinerary = await findOwnedItinerary(req.params.id, req.user);
    return ApiResponse.success(res, 200, 'Itinerario obtenido.', { itinerary });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /itineraries
 * Crea un itinerario. Si no se envía "estimatedBudget", intenta estimarlo
 * automáticamente con el modelo de IA (predicción de presupuesto).
 */
const createItinerary = async (req, res, next) => {
  try {
    const { title, destination, startDate, endDate, itineraryDetails, estimatedBudget } = req.body;

    if (new Date(endDate) < new Date(startDate)) {
      throw new AppError('La fecha de fin no puede ser anterior a la fecha de inicio.', 422);
    }

    let finalBudget = estimatedBudget;

    if (finalBudget === undefined && aiService.isReady()) {
      try {
        const durationDays =
          (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1;
        // Vector de ejemplo: [duración, nº de actividades planeadas]
        const features = [durationDays, Array.isArray(itineraryDetails) ? itineraryDetails.length : 0];
        finalBudget = await aiService.predictBudget(features);
      } catch (aiError) {
        logger.warn(`No se pudo estimar presupuesto automáticamente: ${aiError.message}`);
      }
    }

    const itinerary = await Itinerary.create({
      userId: req.user.id,
      title,
      destination,
      startDate,
      endDate,
      itineraryDetails: itineraryDetails || [],
      estimatedBudget: finalBudget ?? null,
      status: 'borrador',
    });

    return ApiResponse.success(res, 201, 'Itinerario creado.', { itinerary });
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /itineraries/:id
 */
const updateItinerary = async (req, res, next) => {
  try {
    const itinerary = await findOwnedItinerary(req.params.id, req.user);

    const allowedFields = [
      'title',
      'destination',
      'startDate',
      'endDate',
      'itineraryDetails',
      'estimatedBudget',
      'status',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        itinerary[field] = req.body[field];
      }
    });

    await itinerary.save();

    return ApiResponse.success(res, 200, 'Itinerario actualizado.', { itinerary });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /itineraries/:id
 */
const deleteItinerary = async (req, res, next) => {
  try {
    const itinerary = await findOwnedItinerary(req.params.id, req.user);
    await itinerary.destroy();
    return ApiResponse.success(res, 200, 'Itinerario eliminado.');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listItineraries,
  getItinerary,
  createItinerary,
  updateItinerary,
  deleteItinerary,
};
