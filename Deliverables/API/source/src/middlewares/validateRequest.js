/**
 * middlewares/validateRequest.js
 * -----------------------------------------------------------------------
 * Middleware genérico para validar el resultado de las reglas definidas
 * con express-validator en cada ruta. Si existen errores de validación,
 * corta la ejecución y responde con un 422 estandarizado, evitando así
 * que datos inválidos lleguen a los controladores.
 * -----------------------------------------------------------------------
 *
 * Uso en una ruta:
 *   router.post(
 *     '/register',
 *     [body('email').isEmail(), body('password').isLength({ min: 8 })],
 *     validateRequest,
 *     authController.register
 *   );
 */

const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/apiResponse');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return ApiResponse.error(
      res,
      422,
      'Los datos enviados no son válidos.',
      errors.array().map((e) => ({ field: e.path, message: e.msg }))
    );
  }

  return next();
};

module.exports = validateRequest;
