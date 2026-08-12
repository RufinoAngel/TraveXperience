/**
 * controllers/transportController.js
 * -----------------------------------------------------------------------
 * CRUD de rutas de transporte (Admin/registroTransporte.jsx) + búsqueda
 * pública por origen/destino/día (Plataforma Web).
 * -----------------------------------------------------------------------
 */

const TransportRoute = require('../models/mysql/TransportRoute');
const TransportFareClass = require('../models/mysql/TransportFareClass');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');

const withFareClasses = { include: [{ model: TransportFareClass, as: 'fareClasses' }] };

/** Verifica que la ruta exista y pertenezca al admin autenticado. */
const findOwnedRoute = async (id, user) => {
  const route = await TransportRoute.findByPk(id, withFareClasses);
  if (!route) {
    throw new AppError('Ruta de transporte no encontrada.', 404);
  }
  if (route.ownerId !== user.id) {
    throw new AppError('No tienes permiso para modificar esta ruta.', 403);
  }
  return route;
};

/**
 * GET /transport-routes?origin=&destination=&day=&mine=
 * Búsqueda pública por origen/destino/día de la semana ("L","M","X"...).
 * Un administrador con ?mine=true ve solo las suyas (panel de inventario).
 */
const listRoutes = async (req, res, next) => {
  try {
    const { origin, destination, day, mine } = req.query;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const pageSize = Math.min(Number(req.query.pageSize) || 20, 50);

    const where = { isActive: true };
    if (origin) where.origin = origin;
    if (destination) where.destination = destination;
    if (mine === 'true' && req.user) where.ownerId = req.user.id;

    const { rows, count } = await TransportRoute.findAndCountAll({
      where,
      ...withFareClasses,
      order: [['departureTime', 'ASC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    // El filtro por día se aplica en memoria porque daysOfWeek es JSON libre
    // (distinto motor de filtrado que un campo relacional normal en MySQL).
    const filtered = day ? rows.filter((r) => (r.daysOfWeek || []).includes(day)) : rows;

    return ApiResponse.success(res, 200, 'Rutas de transporte obtenidas.', {
      total: day ? filtered.length : count,
      page,
      pageSize,
      routes: filtered,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /transport-routes/:id
 */
const getRoute = async (req, res, next) => {
  try {
    const route = await TransportRoute.findByPk(req.params.id, withFareClasses);
    if (!route || !route.isActive) {
      throw new AppError('Ruta de transporte no encontrada.', 404);
    }
    return ApiResponse.success(res, 200, 'Ruta obtenida.', { route });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /transport-routes
 * Solo administradores. fareClasses se crea anidado en la misma petición:
 * body.fareClasses = [{ name, price, occupancyPct }, ...]
 */
const createRoute = async (req, res, next) => {
  try {
    const {
      company, origin, destination, departureTime, arrivalTime,
      daysOfWeek, capacity, fareClasses,
    } = req.body;

    const route = await TransportRoute.create({
      ownerId: req.user.id,
      company,
      origin,
      destination,
      departureTime,
      arrivalTime,
      daysOfWeek: daysOfWeek || [],
      capacity,
    });

    if (Array.isArray(fareClasses) && fareClasses.length > 0) {
      await TransportFareClass.bulkCreate(
        fareClasses.map((fc) => ({ ...fc, routeId: route.id }))
      );
    }

    const created = await TransportRoute.findByPk(route.id, withFareClasses);

    return ApiResponse.success(res, 201, 'Ruta de transporte creada.', { route: created });
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /transport-routes/:id
 * Si se envía "fareClasses", se REEMPLAZAN por completo las existentes
 * (borra y vuelve a crear), para mantener el contrato simple con el frontend.
 */
const updateRoute = async (req, res, next) => {
  try {
    const route = await findOwnedRoute(req.params.id, req.user);

    const editableFields = [
      'company', 'origin', 'destination', 'departureTime',
      'arrivalTime', 'daysOfWeek', 'capacity', 'isActive',
    ];
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        route[field] = req.body[field];
      }
    });
    await route.save();

    if (Array.isArray(req.body.fareClasses)) {
      await TransportFareClass.destroy({ where: { routeId: route.id } });
      if (req.body.fareClasses.length > 0) {
        await TransportFareClass.bulkCreate(
          req.body.fareClasses.map((fc) => ({ ...fc, routeId: route.id }))
        );
      }
    }

    const updated = await TransportRoute.findByPk(route.id, withFareClasses);

    return ApiResponse.success(res, 200, 'Ruta de transporte actualizada.', { route: updated });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /transport-routes/:id
 */
const deleteRoute = async (req, res, next) => {
  try {
    const route = await findOwnedRoute(req.params.id, req.user);
    await route.destroy(); // TransportFareClass asociadas se eliminan en cascada
    return ApiResponse.success(res, 200, 'Ruta de transporte eliminada.');
  } catch (error) {
    return next(error);
  }
};

module.exports = { listRoutes, getRoute, createRoute, updateRoute, deleteRoute };
