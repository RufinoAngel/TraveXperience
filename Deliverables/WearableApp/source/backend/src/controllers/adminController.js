/**
 * controllers/adminController.js
 * -----------------------------------------------------------------------
 * Panel de Administración. Todas las rutas están protegidas con
 * protect + authorize('administrador') (ver routes/adminRoutes.js) y
 * delegan el cálculo de datos reales a services/adminService.js.
 * -----------------------------------------------------------------------
 */

const adminService = require('../services/adminService');
const ApiResponse = require('../utils/apiResponse');

/**
 * GET /admin/dashboard
 * Estadísticas generales para la vista principal del panel de Admin.
 */
const getDashboard = async (req, res, next) => {
  try {
    const dashboard = await adminService.getDashboard();
    return ApiResponse.success(res, 200, 'Estadísticas del dashboard obtenidas.', dashboard);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /admin/settings
 */
const getSettings = async (req, res, next) => {
  try {
    const settings = await adminService.getSettings();
    return ApiResponse.success(res, 200, 'Configuración obtenida.', { settings });
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /admin/settings
 */
const updateSettings = async (req, res, next) => {
  try {
    const settings = await adminService.updateSettings(req.body, req.user.id);
    return ApiResponse.success(res, 200, 'Configuración actualizada.', { settings });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /admin/finances
 */
const getFinances = async (req, res, next) => {
  try {
    const finances = await adminService.getFinances(req.query);
    return ApiResponse.success(res, 200, 'Información financiera obtenida.', finances);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /admin/transactions
 */
const getTransactions = async (req, res, next) => {
  try {
    const result = await adminService.getTransactions(req.query);
    return ApiResponse.success(res, 200, 'Transacciones obtenidas.', result);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /admin/payment-methods
 */
const listPaymentMethods = async (req, res, next) => {
  try {
    const paymentMethods = await adminService.listPaymentMethods();
    return ApiResponse.success(res, 200, 'Métodos de pago obtenidos.', { paymentMethods });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /admin/payment-methods
 */
const createPaymentMethod = async (req, res, next) => {
  try {
    const paymentMethod = await adminService.createPaymentMethod(req.body, req.user.id);
    return ApiResponse.success(res, 201, 'Método de pago creado.', { paymentMethod });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /admin/payment-methods/:id
 */
const deletePaymentMethod = async (req, res, next) => {
  try {
    await adminService.deletePaymentMethod(req.params.id, req.user.id);
    return ApiResponse.success(res, 200, 'Método de pago eliminado.');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /admin/activity
 */
const getActivity = async (req, res, next) => {
  try {
    const activity = await adminService.getRecentActivity(req.query);
    return ApiResponse.success(res, 200, 'Actividad reciente obtenida.', { activity });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /admin/alerts
 */
const getAlerts = async (req, res, next) => {
  try {
    const alerts = await adminService.getAlerts();
    return ApiResponse.success(res, 200, 'Alertas del sistema obtenidas.', { alerts });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /admin/statistics
 */
const getStatistics = async (req, res, next) => {
  try {
    const statistics = await adminService.getStatistics(req.query);
    return ApiResponse.success(res, 200, 'Estadísticas obtenidas.', statistics);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDashboard,
  getSettings,
  updateSettings,
  getFinances,
  getTransactions,
  listPaymentMethods,
  createPaymentMethod,
  deletePaymentMethod,
  getActivity,
  getAlerts,
  getStatistics,
};
