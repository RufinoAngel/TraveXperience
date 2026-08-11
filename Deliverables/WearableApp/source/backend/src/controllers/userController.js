/**
 * controllers/userController.js
 * -----------------------------------------------------------------------
 * Administración de usuarios (Panel de Admin). Todo protegido con
 * authorize('administrador'). Usa el mismo serializador `toPublicUser`
 * de authController para no exponer password/refreshToken en ninguna
 * respuesta.
 * -----------------------------------------------------------------------
 */

const { Op } = require('sequelize');

const User = require('../models/mysql/User');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');
const { toPublicUser } = require('./authController');

/**
 * GET /users
 * Listado paginado de usuarios. Filtros opcionales: role, isActive, search
 * (busca por nombre o correo).
 */
const listUsers = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const pageSize = Math.min(Number(req.query.pageSize) || 20, 100);

    const where = {};
    if (req.query.role) where.role = req.query.role;
    if (req.query.isActive !== undefined) where.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      where[Op.or] = [
        { fullName: { [Op.like]: `%${req.query.search}%` } },
        { email: { [Op.like]: `%${req.query.search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });

    return ApiResponse.success(res, 200, 'Usuarios obtenidos.', {
      total: count,
      page,
      pageSize,
      users: rows.map(toPublicUser),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) throw new AppError('Usuario no encontrado.', 404);

    return ApiResponse.success(res, 200, 'Usuario obtenido.', { user: toPublicUser(user) });
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /users/:id
 * Permite al admin editar datos básicos de cualquier usuario y, sobre
 * todo, activar/desactivar la cuenta (isActive) o cambiar su rol.
 */
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) throw new AppError('Usuario no encontrado.', 404);

    const editableFields = [
      'fullName',
      'phone',
      'location',
      'bio',
      'companyName',
      'role',
      'isActive',
    ];
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    return ApiResponse.success(res, 200, 'Usuario actualizado.', { user: toPublicUser(user) });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /users/:id
 * Elimina la cuenta de un usuario. Un administrador no puede eliminarse
 * a sí mismo por esta vía (evita quedarse sin acceso al panel por error).
 */
const deleteUser = async (req, res, next) => {
  try {
    const targetId = Number(req.params.id);
    if (targetId === req.user.id) {
      throw new AppError('No puedes eliminar tu propia cuenta desde el panel de administración.', 400);
    }

    const user = await User.findByPk(req.params.id);
    if (!user) throw new AppError('Usuario no encontrado.', 404);

    await user.destroy();

    return ApiResponse.success(res, 200, 'Usuario eliminado.');
  } catch (error) {
    return next(error);
  }
};

module.exports = { listUsers, getUserById, updateUser, deleteUser };
