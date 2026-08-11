/**
 * controllers/authController.js
 * -----------------------------------------------------------------------
 * Módulo 1: Autenticación y Perfiles.
 * Este servicio de Auth es el "núcleo compartido por las tres plataformas"
 * (Web, App Móvil y Smartwatch) mencionado en el Canvas: un mismo login
 * con JWT conecta al usuario en los tres frentes.
 * -----------------------------------------------------------------------
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { OAuth2Client } = require('google-auth-library');

const User = require('../models/mysql/User');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');
const tokenService = require('../services/tokenService');
const logger = require('../utils/logger');
const { toPublicUrl } = require('../utils/upload');
const { sendMail, buildPasswordResetEmail } = require('../services/mailService');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const {
  GOOGLE_CLIENT_ID,
  API_PUBLIC_URL = 'http://localhost:4000',
  FRONTEND_PUBLIC_URL = 'http://localhost:5173',
} = process.env;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

/**
 * Serializa el usuario para respuestas de la API, ocultando campos sensibles.
 */
const toPublicUser = (user) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  companyName: user.companyName,
  phone: user.phone,
  location: user.location,
  bio: user.bio,
  travelPreferences: user.travelPreferences,
  profilePhoto: user.profilePhoto,
  avatar: user.avatar,
  photos: user.photos || [],
  isActive: user.isActive,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt,
});

/**
 * POST /auth/register
 * Registra un "usuario" (viajero) o "administrador" (negocio/comercio),
 * según el selector visto en el mock "Crea tu cuenta".
 */
const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role, companyName, phone, location } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      throw new AppError('Ya existe una cuenta registrada con este correo.', 409);
    }

    if (role === 'administrador' && !companyName) {
      throw new AppError('El nombre de la empresa es obligatorio para cuentas de administrador.', 422);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      fullName,
      email,
      passwordHash,
      role: role || 'usuario',
      companyName: role === 'administrador' ? companyName : null,
      // Datos de perfil capturados desde el registro público (solo aplica a "usuario";
      // las cuentas de administrador se dan de alta por otro medio, sin estos campos).
      phone: role === 'administrador' ? null : phone || null,
      location: role === 'administrador' ? null : location || null,
    });

    const { accessToken, refreshToken, refreshTokenHash } = tokenService.issueTokenPair(user);
    user.refreshTokenHash = refreshTokenHash;
    await user.save();

    logger.info(`Nuevo usuario registrado: ${user.email} (${user.role})`);

    return ApiResponse.success(res, 201, 'Cuenta creada exitosamente.', {
      user: toPublicUser(user),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /auth/login
 * Válido para las tres plataformas (Web, App Móvil, Smartwatch): el
 * Smartwatch normalmente reutiliza el refreshToken emitido por el
 * teléfono en lugar de pedir credenciales directamente en el reloj.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !user.isActive) {
      throw new AppError('Credenciales inválidas.', 401);
    }

    if (!user.passwordHash) {
      // Cuenta creada vía Google Sign-In: no tiene contraseña propia todavía.
      throw new AppError(
        'Esta cuenta usa "Continuar con Google". Inicia sesión con Google o configura una contraseña desde tu perfil.',
        401
      );
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new AppError('Credenciales inválidas.', 401);
    }

    const { accessToken, refreshToken, refreshTokenHash } = tokenService.issueTokenPair(user);
    user.refreshTokenHash = refreshTokenHash;
    user.lastLogin = new Date();
    await user.save();

    return ApiResponse.success(res, 200, 'Inicio de sesión exitoso.', {
      user: toPublicUser(user),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /auth/google
 * Login/registro con "Continuar con Google". Recibe el idToken emitido
 * por el botón de Google Identity Services en el frontend, lo verifica
 * contra GOOGLE_CLIENT_ID y crea o vincula la cuenta correspondiente.
 * Si el backend no tiene GOOGLE_CLIENT_ID configurado, responde 503 en
 * vez de fingir que la autenticación funcionó.
 */
const googleAuth = async (req, res, next) => {
  try {
    if (!googleClient) {
      throw new AppError(
        'El inicio de sesión con Google no está configurado en el servidor (falta GOOGLE_CLIENT_ID).',
        503
      );
    }

    const { idToken } = req.body;
    if (!idToken) {
      throw new AppError('Se requiere el idToken de Google.', 400);
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw new AppError('El token de Google es inválido o expiró.', 401);
    }

    if (!payload || !payload.email) {
      throw new AppError('No se pudo obtener el correo desde la cuenta de Google.', 401);
    }

    if (payload.email_verified === false) {
      throw new AppError('Tu correo de Google no está verificado.', 401);
    }

    let user = await User.findOne({ where: { googleId: payload.sub } });

    if (!user) {
      user = await User.findOne({ where: { email: payload.email } });
    }

    if (user) {
      if (!user.isActive) {
        throw new AppError('Esta cuenta está desactivada.', 401);
      }
      // Vincula el googleId si el usuario ya existía por registro tradicional.
      if (!user.googleId) {
        user.googleId = payload.sub;
      }
      if (!user.profilePhoto && payload.picture) {
        user.profilePhoto = payload.picture;
      }
    } else {
      user = await User.create({
        fullName: payload.name || payload.email.split('@')[0],
        email: payload.email,
        passwordHash: null,
        role: 'usuario',
        googleId: payload.sub,
        profilePhoto: payload.picture || null,
      });
      logger.info(`Nuevo usuario registrado vía Google: ${user.email}`);
    }

    const { accessToken, refreshToken, refreshTokenHash } = tokenService.issueTokenPair(user);
    user.refreshTokenHash = refreshTokenHash;
    user.lastLogin = new Date();
    await user.save();

    return ApiResponse.success(res, 200, 'Inicio de sesión con Google exitoso.', {
      user: toPublicUser(user),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /auth/refresh-token
 * Emite un nuevo accessToken a partir de un refreshToken válido y no
 * revocado. Es la operación que más usará el Smartwatch, ya que sus
 * sesiones de sincronización son frecuentes y de vida corta.
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: incomingToken } = req.body;
    if (!incomingToken) {
      throw new AppError('Se requiere un refreshToken.', 400);
    }

    let decoded;
    try {
      decoded = tokenService.verifyToken(incomingToken);
    } catch {
      throw new AppError('Refresh token inválido o expirado.', 401);
    }

    const user = await User.findByPk(decoded.id);
    const incomingHash = tokenService.hashToken(incomingToken);

    if (!user || !user.refreshTokenHash || user.refreshTokenHash !== incomingHash) {
      throw new AppError('La sesión ya no es válida. Inicia sesión nuevamente.', 401);
    }

    const { accessToken, refreshToken: newRefreshToken, refreshTokenHash } =
      tokenService.issueTokenPair(user);
    user.refreshTokenHash = refreshTokenHash;
    await user.save();

    return ApiResponse.success(res, 200, 'Token renovado.', {
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /auth/logout
 * Invalida el refreshToken actual (cierra sesión en la plataforma que lo invoque).
 */
const logout = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (user) {
      user.refreshTokenHash = null;
      await user.save();
    }
    return ApiResponse.success(res, 200, 'Sesión cerrada correctamente.');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /auth/me
 * Perfil del usuario autenticado. Usado por Web y App Móvil tras el login;
 * el Smartwatch normalmente solo necesita fullName vía el propio JWT.
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) throw new AppError('Usuario no encontrado.', 404);
    return ApiResponse.success(res, 200, 'Perfil obtenido.', { user: toPublicUser(user) });
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /auth/profile
 * Actualiza los datos públicos del perfil (fullName, phone, location, bio).
 * Separado de /preferences porque son datos de identidad, no de personalización IA.
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) throw new AppError('Usuario no encontrado.', 404);

    const editableFields = ['fullName', 'phone', 'location', 'bio', 'companyName'];
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    const profilePhotoFile = req.file || (req.files && req.files.profilePhoto && req.files.profilePhoto[0]);
    if (profilePhotoFile) {
      user.profilePhoto = toPublicUrl(profilePhotoFile.path);
    }

    const uploadedPhotos = req.files && req.files.photos ? req.files.photos.map((file) => toPublicUrl(file.path)) : [];
    if (uploadedPhotos.length > 0) {
      const currentPhotos = Array.isArray(user.photos) ? user.photos : [];
      user.photos = [...currentPhotos, ...uploadedPhotos];
    }

    if (req.body.photos !== undefined) {
      let parsedPhotos = req.body.photos;
      if (typeof parsedPhotos === 'string') {
        try {
          parsedPhotos = JSON.parse(parsedPhotos);
        } catch {
          parsedPhotos = [parsedPhotos];
        }
      }
      user.photos = Array.isArray(parsedPhotos) ? parsedPhotos : [];
    }

    if (req.body.profilePhotoUrl) {
      user.profilePhoto = req.body.profilePhotoUrl;
    }

    await user.save();

    return ApiResponse.success(res, 200, 'Perfil actualizado.', { user: toPublicUser(user) });
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /auth/profile/avatar
 * Actualiza específicamente la foto de perfil ("avatar") del usuario.
 * Recibe la imagen como multipart/form-data en el campo "avatar", la
 * guarda con el mismo mecanismo de almacenamiento que ya usa el resto
 * de fotos del perfil, y persiste la referencia en la columna `avatar`.
 * Responde con el usuario completo (mismo formato que /auth/profile)
 * para que la app pueda refrescar la pantalla de inmediato.
 */
const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('Se requiere un archivo de imagen en el campo "avatar".', 400);
    }

    const user = await User.findByPk(req.user.id);
    if (!user) throw new AppError('Usuario no encontrado.', 404);

    user.avatar = toPublicUrl(req.file.path);
    await user.save();

    return ApiResponse.success(res, 200, 'Foto de perfil actualizada.', { user: toPublicUser(user) });
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /auth/preferences
 * Actualiza las preferencias de viaje, que alimentan directamente al
 * modelo de clustering (Machine Learning) para personalizar recomendaciones.
 */
const updatePreferences = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) throw new AppError('Usuario no encontrado.', 404);

    user.travelPreferences = { ...user.travelPreferences, ...req.body };
    await user.save();

    return ApiResponse.success(res, 200, 'Preferencias actualizadas.', {
      travelPreferences: user.travelPreferences,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /auth/change-password
 * Cambia la contraseña estando ya autenticado (pantalla "Privacidad y
 * Seguridad"), a diferencia de /forgot-password + /reset-password que
 * es el flujo para cuando NO se tiene sesión iniciada.
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) throw new AppError('Usuario no encontrado.', 404);

    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) {
      throw new AppError('La contraseña actual es incorrecta.', 401);
    }

    user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.refreshTokenHash = null; // fuerza a re-loguearse en todas las plataformas
    await user.save();

    return ApiResponse.success(res, 200, 'Contraseña actualizada correctamente.');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /auth/forgot-password
 * Genera un token de recuperación de un solo uso (válido 1 hora) y lo
 * "envía" al correo del usuario. En fase piloto (sin proveedor de email
 * configurado) el enlace se registra en el log del servidor.
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    // Respuesta genérica siempre (evita enumerar correos registrados)
    const genericMessage =
      'Si el correo existe en nuestro sistema, se ha enviado un enlace de recuperación.';

    if (!user) {
      return ApiResponse.success(res, 200, genericMessage);
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = tokenService.hashToken(rawToken);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    await user.save();

    const frontendBase = FRONTEND_PUBLIC_URL || API_PUBLIC_URL.replace(/\/api\/v\d+\/?$/, '');
    const resetLink = `${frontendBase.replace(/\/$/, '')}/#reset-password?token=${encodeURIComponent(rawToken)}`;
    const logoUrl = `${frontendBase.replace(/\/$/, '')}/trave.svg`;
    const { subject, html, text } = buildPasswordResetEmail({
      fullName: user.fullName,
      resetLink,
      logoUrl,
    });

    await sendMail({
      to: user.email,
      subject,
      html,
      text,
    });

    logger.info(`🔑 Enlace de recuperación enviado a ${email}`);

    return ApiResponse.success(res, 200, genericMessage);
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /auth/reset-password
 * Completa el flujo de recuperación validando el token enviado por correo.
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const hashedToken = tokenService.hashToken(token);

    const user = await User.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      throw new AppError('El token de recuperación es inválido o ha expirado.', 400);
    }

    user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.refreshTokenHash = null; // fuerza a re-loguearse en todas las plataformas
    await user.save();

    return ApiResponse.success(res, 200, 'Contraseña actualizada correctamente.');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  updateAvatar,
  updatePreferences,
  changePassword,
  forgotPassword,
  resetPassword,
  toPublicUser,
};
