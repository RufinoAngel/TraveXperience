/**
 * services/adminService.js
 * -----------------------------------------------------------------------
 * Módulo de Administración. Concentra TODA la lógica de agregación de
 * datos reales (MySQL + MongoDB) que alimenta el panel de Admin:
 * Dashboard, Configuraciones, Finanzas, Transacciones, Métodos de pago,
 * Actividad reciente, Alertas y Estadísticas.
 *
 * No hay un modelo único de "Reserva": las reservas/bookings de la
 * plataforma están representadas por `Itinerary` (MySQL) — un itinerario
 * en estado 'confirmado' | 'en_curso' | 'finalizado' equivale a una
 * reserva activa/concretada, mientras que 'cancelado' representa una
 * cancelación y 'borrador' una reserva aún no confirmada.
 *
 * Los ingresos se calculan a partir de `Transaction` (MySQL, pagos vía
 * Stripe): status 'succeeded' = ingreso cobrado, 'refunded' = reembolso,
 * 'pending' = pago pendiente, 'failed' = pago fallido.
 * -----------------------------------------------------------------------
 */

const { Op } = require('sequelize');

const User = require('../models/mysql/User');
const Itinerary = require('../models/mysql/Itinerary');
const Transaction = require('../models/mysql/Transaction');
const TransportRoute = require('../models/mysql/TransportRoute');

const Hotel = require('../models/mongodb/Hotel');
const Place = require('../models/mongodb/Place');
const Review = require('../models/mongodb/Review');
const ActivityLog = require('../models/mongodb/ActivityLog');
const SystemSetting = require('../models/mongodb/SystemSetting');
const PaymentMethod = require('../models/mongodb/PaymentMethod');
const AdminActivityLog = require('../models/mongodb/AdminActivityLog');

const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// Estados de Itinerary que se consideran una reserva activa/concretada.
const BOOKING_STATUSES = ['confirmado', 'en_curso', 'finalizado'];

// -----------------------------------------------------------------------
// Helpers de fecha y número
// -----------------------------------------------------------------------

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

const sumAmount = (rows, field = 'amount') =>
  round2(rows.reduce((acc, row) => acc + Number(row[field] || 0), 0));

/** Crecimiento porcentual entre dos periodos, redondeado a 1 decimal. */
const calculateGrowth = (current, previous) => {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

/** Rango [inicio, fin) del mes que contiene `date` (por defecto: hoy). */
const getMonthRange = (date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
};

const monthLabel = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

/** Genera los últimos `count` meses (incluido el actual), del más antiguo al más reciente. */
const getLastMonths = (count, from = new Date()) => {
  const months = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const ref = new Date(from.getFullYear(), from.getMonth() - i, 1);
    const { start, end } = getMonthRange(ref);
    months.push({ label: monthLabel(ref), start, end });
  }
  return months;
};

// -----------------------------------------------------------------------
// Configuración (system_settings)
// -----------------------------------------------------------------------

/** Obtiene la configuración global, creándola con valores por defecto si no existe. */
const getSettings = async () => {
  let settings = await SystemSetting.findOne({ key: 'global' });
  if (!settings) {
    settings = await SystemSetting.create({ key: 'global' });
    logger.info('⚙️  Documento de configuración global creado con valores por defecto.');
  }
  return settings;
};

const SETTABLE_FIELDS = [
  'platformName',
  'supportEmail',
  'currency',
  'language',
  'bookingCommissionPct',
  'refundWindowDays',
  'autoApprovePartners',
  'emailNotifications',
  'smsNotifications',
  'twoFactorAuth',
  'maintenanceMode',
];

const updateSettings = async (payload, adminId) => {
  const settings = await getSettings();

  const changes = [];
  SETTABLE_FIELDS.forEach((field) => {
    if (payload[field] !== undefined && payload[field] !== settings[field]) {
      changes.push(field);
      settings[field] = payload[field];
    }
  });
  settings.updatedBy = adminId;
  await settings.save();

  if (changes.length > 0) {
    await AdminActivityLog.create({
      adminId,
      action: 'update_settings',
      description: `Configuración actualizada: ${changes.join(', ')}.`,
      severity: 'info',
      metadata: { changes },
    });
  }

  return settings;
};

// -----------------------------------------------------------------------
// Bloques reutilizables (usuarios, reservas, ingresos, satisfacción, etc.)
// -----------------------------------------------------------------------

const getUserStats = async () => {
  const now = new Date();
  const thisMonth = getMonthRange(now);
  const lastMonth = getMonthRange(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const [total, active, thisMonthCount, lastMonthCount] = await Promise.all([
    User.count(),
    User.count({ where: { isActive: true } }),
    User.count({ where: { createdAt: { [Op.gte]: thisMonth.start } } }),
    User.count({
      where: { createdAt: { [Op.gte]: lastMonth.start, [Op.lt]: lastMonth.end } },
    }),
  ]);

  return {
    total,
    active,
    newThisMonth: thisMonthCount,
    growth: calculateGrowth(thisMonthCount, lastMonthCount),
  };
};

const getBookingStats = async () => {
  const now = new Date();
  const thisMonth = getMonthRange(now);
  const lastMonth = getMonthRange(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const [total, thisMonthCount, lastMonthCount] = await Promise.all([
    Itinerary.count({ where: { status: { [Op.in]: BOOKING_STATUSES } } }),
    Itinerary.count({
      where: { status: { [Op.in]: BOOKING_STATUSES }, createdAt: { [Op.gte]: thisMonth.start } },
    }),
    Itinerary.count({
      where: {
        status: { [Op.in]: BOOKING_STATUSES },
        createdAt: { [Op.gte]: lastMonth.start, [Op.lt]: lastMonth.end },
      },
    }),
  ]);

  return {
    total,
    newThisMonth: thisMonthCount,
    growth: calculateGrowth(thisMonthCount, lastMonthCount),
  };
};

const getRevenueStats = async () => {
  const now = new Date();
  const thisMonth = getMonthRange(now);
  const lastMonth = getMonthRange(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const [allSucceeded, thisMonthRows, lastMonthRows] = await Promise.all([
    Transaction.findAll({ where: { status: 'succeeded' }, attributes: ['amount'] }),
    Transaction.findAll({
      where: { status: 'succeeded', createdAt: { [Op.gte]: thisMonth.start } },
      attributes: ['amount'],
    }),
    Transaction.findAll({
      where: {
        status: 'succeeded',
        createdAt: { [Op.gte]: lastMonth.start, [Op.lt]: lastMonth.end },
      },
      attributes: ['amount'],
    }),
  ]);

  const total = sumAmount(allSucceeded);
  const thisMonthTotal = sumAmount(thisMonthRows);
  const lastMonthTotal = sumAmount(lastMonthRows);

  return {
    total,
    thisMonth: thisMonthTotal,
    growth: calculateGrowth(thisMonthTotal, lastMonthTotal),
  };
};

/** Satisfacción global (0-100), calculada a partir del promedio de reseñas (1-5 estrellas). */
const getSatisfactionStats = async () => {
  const now = new Date();
  const thisMonth = getMonthRange(now);
  const lastMonth = getMonthRange(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const [overallAgg, thisMonthAgg, lastMonthAgg] = await Promise.all([
    Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
    Review.aggregate([
      { $match: { createdAt: { $gte: thisMonth.start } } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]),
    Review.aggregate([
      { $match: { createdAt: { $gte: lastMonth.start, $lt: lastMonth.end } } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]),
  ]);

  const toScore = (agg) => (agg[0]?.avg ? round2((agg[0].avg / 5) * 100) : 0);

  const score = toScore(overallAgg);
  const thisMonthScore = toScore(thisMonthAgg);
  const lastMonthScore = toScore(lastMonthAgg);

  return {
    score,
    growth: calculateGrowth(thisMonthScore, lastMonthScore),
  };
};

/** Tendencia de reservas e ingresos de los últimos `count` meses. */
const getBookingTrends = async (count = 6) => {
  const months = getLastMonths(count);

  const [itineraries, transactions] = await Promise.all([
    Itinerary.findAll({
      where: {
        status: { [Op.in]: BOOKING_STATUSES },
        createdAt: { [Op.gte]: months[0].start },
      },
      attributes: ['createdAt'],
    }),
    Transaction.findAll({
      where: { status: 'succeeded', createdAt: { [Op.gte]: months[0].start } },
      attributes: ['amount', 'createdAt'],
    }),
  ]);

  return months.map(({ label, start, end }) => {
    const bookings = itineraries.filter(
      (it) => it.createdAt >= start && it.createdAt < end
    ).length;
    const revenue = sumAmount(
      transactions.filter((t) => t.createdAt >= start && t.createdAt < end)
    );
    return { month: label, bookings, revenue };
  });
};

/** Destinos más populares según cantidad de reservas confirmadas. */
const getTopDestinations = async (limit = 5) => {
  const itineraries = await Itinerary.findAll({
    where: { status: { [Op.in]: BOOKING_STATUSES } },
    attributes: ['destination'],
  });

  const counts = itineraries.reduce((acc, { destination }) => {
    acc[destination] = (acc[destination] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([destination, bookings]) => ({ destination, bookings }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, limit);
};

/**
 * Hoteles con mayor volumen de reservas. El esquema actual no liga un
 * Itinerary a un Hotel específico (los itinerarios usan `destination`
 * como texto libre), así que se usa `ratingCount` (reseñas recibidas)
 * como proxy real de actividad/reservas del hotel, ordenado desc.
 */
const getTopHotels = async (limit = 5) =>
  Hotel.find({ isActive: true })
    .sort({ ratingCount: -1, ratingAvg: -1 })
    .limit(limit)
    .select('name municipality ratingAvg ratingCount')
    .lean();

/** Lugares más visitados, según eventos `view_place` registrados en ActivityLog. */
const getTopPlaces = async (limit = 5) => {
  const views = await ActivityLog.aggregate([
    { $match: { eventType: 'view_place', entityType: 'place', entityId: { $ne: null } } },
    { $group: { _id: '$entityId', views: { $sum: 1 } } },
    { $sort: { views: -1 } },
    { $limit: limit },
  ]);

  if (views.length === 0) {
    // Sin datos de vistas todavía: se recurre a ratingCount como respaldo.
    return Place.find({ isActive: true })
      .sort({ ratingCount: -1, ratingAvg: -1 })
      .limit(limit)
      .select('name municipality ratingAvg ratingCount')
      .lean();
  }

  const places = await Place.find({ _id: { $in: views.map((v) => v._id) } })
    .select('name municipality ratingAvg')
    .lean();
  const placesById = new Map(places.map((p) => [String(p._id), p]));

  return views
    .map((v) => {
      const place = placesById.get(String(v._id));
      if (!place) return null;
      return { ...place, views: v.views };
    })
    .filter(Boolean);
};

// -----------------------------------------------------------------------
// Actividad reciente
// -----------------------------------------------------------------------

const buildRecentActivity = async (limit = 20) => {
  const fetchLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const [newUsers, newBookings, cancelledBookings, payments, refunds, newHotels, newPlaces, adminLogs] =
    await Promise.all([
      User.findAll({
        order: [['createdAt', 'DESC']],
        limit: fetchLimit,
        attributes: ['id', 'fullName', 'email', 'createdAt'],
      }),
      Itinerary.findAll({
        where: { status: { [Op.in]: BOOKING_STATUSES } },
        order: [['createdAt', 'DESC']],
        limit: fetchLimit,
        attributes: ['id', 'title', 'destination', 'status', 'createdAt'],
      }),
      Itinerary.findAll({
        where: { status: 'cancelado' },
        order: [['updatedAt', 'DESC']],
        limit: fetchLimit,
        attributes: ['id', 'title', 'destination', 'updatedAt'],
      }),
      Transaction.findAll({
        where: { status: 'succeeded' },
        order: [['createdAt', 'DESC']],
        limit: fetchLimit,
        attributes: ['id', 'amount', 'currency', 'createdAt'],
      }),
      Transaction.findAll({
        where: { status: 'refunded' },
        order: [['updatedAt', 'DESC']],
        limit: fetchLimit,
        attributes: ['id', 'amount', 'currency', 'updatedAt'],
      }),
      Hotel.find().sort({ createdAt: -1 }).limit(fetchLimit).select('name createdAt').lean(),
      Place.find().sort({ createdAt: -1 }).limit(fetchLimit).select('name createdAt').lean(),
      AdminActivityLog.find().sort({ createdAt: -1 }).limit(fetchLimit).lean(),
    ]);

  const events = [];

  newUsers.forEach((u) =>
    events.push({
      type: 'usuario_nuevo',
      message: `Nuevo usuario registrado: ${u.fullName}`,
      date: u.createdAt,
      metadata: { userId: u.id, email: u.email },
    })
  );

  newBookings.forEach((b) =>
    events.push({
      type: 'reserva_creada',
      message: `Nueva reserva: "${b.title}" a ${b.destination}`,
      date: b.createdAt,
      metadata: { itineraryId: b.id, status: b.status },
    })
  );

  cancelledBookings.forEach((b) =>
    events.push({
      type: 'reserva_cancelada',
      message: `Reserva cancelada: "${b.title}" a ${b.destination}`,
      date: b.updatedAt,
      metadata: { itineraryId: b.id },
    })
  );

  payments.forEach((t) =>
    events.push({
      type: 'pago_recibido',
      message: `Pago recibido por ${t.amount} ${(t.currency || 'mxn').toUpperCase()}`,
      date: t.createdAt,
      metadata: { transactionId: t.id },
    })
  );

  refunds.forEach((t) =>
    events.push({
      type: 'reembolso_procesado',
      message: `Reembolso procesado por ${t.amount} ${(t.currency || 'mxn').toUpperCase()}`,
      date: t.updatedAt,
      metadata: { transactionId: t.id },
    })
  );

  newHotels.forEach((h) =>
    events.push({
      type: 'hotel_agregado',
      message: `Nuevo hotel agregado: ${h.name}`,
      date: h.createdAt,
      metadata: { hotelId: h._id },
    })
  );

  newPlaces.forEach((p) =>
    events.push({
      type: 'lugar_agregado',
      message: `Nuevo lugar agregado: ${p.name}`,
      date: p.createdAt,
      metadata: { placeId: p._id },
    })
  );

  adminLogs.forEach((l) =>
    events.push({
      type: l.action,
      message: l.description,
      date: l.createdAt,
      metadata: l.metadata,
    })
  );

  return events
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, fetchLimit)
    .map((event, index) => ({
      id: index + 1,
      ...event,
      // Alias: cada evento ya trae `message` con la descripción legible
      // ("Nuevo usuario registrado: María...", etc.) — se agrega también
      // como `title` porque el frontend mostraba solo la fecha, lo que
      // indica que estaba leyendo una llave que no existía en la
      // respuesta.
      title: event.message,
    }));
};

const getRecentActivity = async (query = {}) => buildRecentActivity(query.limit);

// -----------------------------------------------------------------------
// Alertas del sistema
// -----------------------------------------------------------------------

const buildAlerts = async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    failedPayments,
    pendingReservations,
    inactiveRoutes,
    pendingHotels,
    incidents,
  ] = await Promise.all([
    Transaction.findAll({
      where: { status: 'failed', createdAt: { [Op.gte]: thirtyDaysAgo } },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'amount', 'currency', 'createdAt'],
    }),
    Itinerary.findAll({
      where: { status: 'borrador', createdAt: { [Op.lte]: oneDayAgo } },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'destination', 'createdAt'],
    }),
    TransportRoute.findAll({
      where: { isActive: false },
      order: [['updatedAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'company', 'origin', 'destination', 'updatedAt'],
    }),
    Hotel.find({ isActive: false })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('name municipality updatedAt')
      .lean(),
    AdminActivityLog.find({ action: 'system_incident', resolved: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const alerts = [];

  if (failedPayments.length > 0) {
    alerts.push({
      type: 'pagos_fallidos',
      severity: 'critical',
      title: 'Pagos fallidos',
      message: `${failedPayments.length} pago(s) fallido(s) en los últimos 30 días.`,
      count: failedPayments.length,
      items: failedPayments.map((t) => ({
        id: t.id,
        amount: t.amount,
        currency: t.currency,
        date: t.createdAt,
      })),
    });
  }

  if (pendingReservations.length > 0) {
    alerts.push({
      type: 'reservas_pendientes',
      severity: 'warning',
      title: 'Reservas pendientes de confirmación',
      message: `${pendingReservations.length} reserva(s) llevan más de 24 horas sin confirmarse.`,
      count: pendingReservations.length,
      items: pendingReservations.map((it) => ({
        id: it.id,
        title: it.title,
        destination: it.destination,
        date: it.createdAt,
      })),
    });
  }

  if (inactiveRoutes.length > 0) {
    alerts.push({
      type: 'proveedores_con_errores',
      severity: 'warning',
      title: 'Proveedores de transporte con incidencias',
      message: `${inactiveRoutes.length} ruta(s) de transporte desactivada(s) requieren revisión.`,
      count: inactiveRoutes.length,
      items: inactiveRoutes.map((r) => ({
        id: r.id,
        company: r.company,
        route: `${r.origin} → ${r.destination}`,
        date: r.updatedAt,
      })),
    });
  }

  if (pendingHotels.length > 0) {
    alerts.push({
      type: 'hoteles_pendientes',
      severity: 'info',
      title: 'Hoteles pendientes de aprobación',
      message: `${pendingHotels.length} hotel(es) inactivo(s)/pendiente(s) de publicación.`,
      count: pendingHotels.length,
      items: pendingHotels.map((h) => ({
        id: h._id,
        name: h.name,
        municipality: h.municipality,
        date: h.updatedAt,
      })),
    });
  }

  if (incidents.length > 0) {
    alerts.push({
      type: 'incidencias_sistema',
      severity: 'critical',
      title: 'Incidencias del sistema',
      message: `${incidents.length} incidencia(s) sin resolver.`,
      count: incidents.length,
      items: incidents.map((i) => ({
        id: i._id,
        description: i.description,
        date: i.createdAt,
      })),
    });
  }

  return alerts;
};

const getAlerts = async () => buildAlerts();

// -----------------------------------------------------------------------
// Dashboard
// -----------------------------------------------------------------------

const getDashboard = async () => {
  const [users, bookings, revenue, satisfaction, trends, topDestinations, activity, alerts] =
    await Promise.all([
      getUserStats(),
      getBookingStats(),
      getRevenueStats(),
      getSatisfactionStats(),
      getBookingTrends(6),
      getTopDestinations(5),
      buildRecentActivity(8),
      buildAlerts(),
    ]);

  return {
    users,
    bookings,
    revenue,
    satisfaction,
    bookingTrends: trends,
    topDestinations,
    recentActivity: activity,
    alerts,
    // Alias de nivel superior para las tarjetas del dashboard ("Usuarios
    // Activos", "Ingresos Totales"), que llegaban null/undefined porque
    // solo existían anidados (users.active, revenue.total) y bajo un
    // nombre distinto al que consume el frontend.
    activeUsers: users.active,
    totalRevenue: revenue.total,
  };
};

// -----------------------------------------------------------------------
// Finanzas
// -----------------------------------------------------------------------

const getFinances = async (query = {}) => {
  const monthsCount = Math.min(Math.max(Number(query.months) || 6, 1), 24);
  const settings = await getSettings();

  const [allSucceeded, allRefunded, allPending, months] = await Promise.all([
    Transaction.findAll({
      where: { status: 'succeeded' },
      attributes: ['amount', 'currency', 'createdAt', 'metadata'],
    }),
    Transaction.findAll({ where: { status: 'refunded' }, attributes: ['amount'] }),
    Transaction.findAll({ where: { status: 'pending' }, attributes: ['amount'] }),
    Promise.resolve(getLastMonths(monthsCount)),
  ]);

  const totalRevenue = sumAmount(allSucceeded);
  const thisMonth = getMonthRange();
  const monthlyRevenue = sumAmount(
    allSucceeded.filter((t) => t.createdAt >= thisMonth.start)
  );

  const revenueByMonth = months.map(({ label, start, end }) => ({
    month: label,
    revenue: sumAmount(allSucceeded.filter((t) => t.createdAt >= start && t.createdAt < end)),
  }));

  const commissionsGenerated = round2(totalRevenue * (settings.bookingCommissionPct / 100));

  const refunds = {
    total: sumAmount(allRefunded),
    count: allRefunded.length,
  };

  const pendingPayments = {
    total: sumAmount(allPending),
    count: allPending.length,
  };

  const expensesByCategoryMap = allSucceeded.reduce((acc, t) => {
    const category = (t.metadata && t.metadata.category) || 'General';
    acc[category] = (acc[category] || 0) + Number(t.amount || 0);
    return acc;
  }, {});
  const expensesByCategory = Object.entries(expensesByCategoryMap)
    .map(([category, amount]) => ({ category, amount: round2(amount) }))
    .sort((a, b) => b.amount - a.amount);

  // "Ahorros recientes": diferencia entre el presupuesto estimado por el
  // viajero (Itinerary.estimatedBudget) y lo efectivamente pagado
  // (transacciones succeeded ligadas a ese itinerario), cuando es positiva.
  const itinerariesWithBudget = await Itinerary.findAll({
    where: { estimatedBudget: { [Op.ne]: null } },
    attributes: ['id', 'title', 'destination', 'estimatedBudget', 'createdAt'],
    include: [
      {
        model: Transaction,
        as: 'transactions',
        attributes: ['amount'],
        where: { status: 'succeeded' },
        required: false,
      },
    ],
    order: [['createdAt', 'DESC']],
    limit: 50,
  });

  const savingsList = itinerariesWithBudget
    .map((it) => {
      const paid = sumAmount(it.transactions || []);
      const savings = round2(Number(it.estimatedBudget) - paid);
      return {
        itineraryId: it.id,
        title: it.title,
        destination: it.destination,
        budget: Number(it.estimatedBudget),
        paid,
        savings,
        date: it.createdAt,
      };
    })
    .filter((s) => s.savings > 0)
    .slice(0, 5);

  const recentSavings = {
    total: round2(savingsList.reduce((acc, s) => acc + s.savings, 0)),
    items: savingsList,
  };

  // "Presupuesto": suma de presupuestos declarados por los viajeros en sus itinerarios.
  const budgetRows = await Itinerary.findAll({
    where: { estimatedBudget: { [Op.ne]: null } },
    attributes: ['estimatedBudget'],
  });
  const budget = sumAmount(budgetRows, 'estimatedBudget');

  return {
    totalRevenue,
    monthlyRevenue,
    revenueByMonth,
    commissionsGenerated,
    commissionRate: settings.bookingCommissionPct,
    refunds,
    pendingPayments,
    recentSavings,
    budget,
    expensesByCategory,
    currency: settings.currency,
  };
};

// -----------------------------------------------------------------------
// Transacciones (historial paginado)
// -----------------------------------------------------------------------

const getTransactions = async (query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(query.pageSize) || 20, 1), 100);

  const where = {};
  const andConditions = [];

  if (query.status) {
    where.status = query.status;
  }

  if (query.startDate || query.endDate) {
    where.createdAt = {};
    if (query.startDate) where.createdAt[Op.gte] = new Date(query.startDate);
    if (query.endDate) where.createdAt[Op.lte] = new Date(query.endDate);
  }

  if (query.category) {
    // Filtra por metadata.category (JSON) usando la sintaxis anidada de Sequelize.
    andConditions.push({ metadata: { category: query.category } });
  }

  if (query.search) {
    andConditions.push({
      [Op.or]: [
        { description: { [Op.like]: `%${query.search}%` } },
        { providerPaymentIntentId: { [Op.like]: `%${query.search}%` } },
        { '$owner.fullName$': { [Op.like]: `%${query.search}%` } },
        { '$owner.email$': { [Op.like]: `%${query.search}%` } },
      ],
    });
  }

  if (andConditions.length > 0) {
    where[Op.and] = andConditions;
  }

  const { count, rows } = await Transaction.findAndCountAll({
    where,
    include: [
      { model: User, as: 'owner', attributes: ['id', 'fullName', 'email'], required: false },
      { model: Itinerary, as: 'itinerary', attributes: ['id', 'title', 'destination'], required: false },
    ],
    order: [['createdAt', 'DESC']],
    offset: (page - 1) * pageSize,
    limit: pageSize,
    subQuery: false,
  });

  const transactions = rows.map((t) => ({
    id: t.id,
    provider: t.provider,
    amount: t.amount,
    currency: t.currency,
    status: t.status,
    description: t.description,
    category: (t.metadata && t.metadata.category) || (t.itinerary ? 'Reserva' : 'General'),
    user: t.owner ? { id: t.owner.id, fullName: t.owner.fullName, email: t.owner.email } : null,
    itinerary: t.itinerary
      ? { id: t.itinerary.id, title: t.itinerary.title, destination: t.itinerary.destination }
      : null,
    createdAt: t.createdAt,
  }));

  return { total: count, page, pageSize, transactions };
};

// -----------------------------------------------------------------------
// Métodos de pago (catálogo administrado por la plataforma)
// -----------------------------------------------------------------------

const listPaymentMethods = async () => PaymentMethod.find().sort({ createdAt: -1 }).lean();

const createPaymentMethod = async (data, adminId) => {
  const method = await PaymentMethod.create({
    name: data.name,
    type: data.type,
    provider: data.provider || null,
    description: data.description || null,
    isActive: data.isActive !== undefined ? data.isActive : true,
    details: data.details || {},
    createdBy: adminId,
  });

  await AdminActivityLog.create({
    adminId,
    action: 'create_payment_method',
    description: `Método de pago agregado: ${method.name}.`,
    severity: 'info',
    metadata: { paymentMethodId: method._id },
  });

  return method;
};

const deletePaymentMethod = async (id, adminId) => {
  const method = await PaymentMethod.findByIdAndDelete(id);
  if (!method) throw new AppError('Método de pago no encontrado.', 404);

  await AdminActivityLog.create({
    adminId,
    action: 'delete_payment_method',
    description: `Método de pago eliminado: ${method.name}.`,
    severity: 'info',
    metadata: { paymentMethodId: method._id },
  });

  return method;
};

// -----------------------------------------------------------------------
// Estadísticas agregadas
// -----------------------------------------------------------------------

const getStatistics = async (query = {}) => {
  const monthsCount = Math.min(Math.max(Number(query.months) || 6, 1), 24);
  const months = getLastMonths(monthsCount);

  const [
    registeredUsers,
    activeUsers,
    hotelsCount,
    placesCount,
    transportsCount,
    reservationsByStatusRaw,
    revenueRows,
    topDestinations,
    topHotels,
    topPlaces,
    userRows,
  ] = await Promise.all([
    User.count(),
    User.count({ where: { isActive: true } }),
    Hotel.countDocuments({ isActive: true }),
    Place.countDocuments({ isActive: true }),
    TransportRoute.count({ where: { isActive: true } }),
    Itinerary.findAll({ attributes: ['status'] }),
    Transaction.findAll({
      where: { status: 'succeeded', createdAt: { [Op.gte]: months[0].start } },
      attributes: ['amount', 'createdAt', 'metadata'],
    }),
    getTopDestinations(10),
    getTopHotels(10),
    getTopPlaces(10),
    User.findAll({ attributes: ['createdAt'], where: { createdAt: { [Op.gte]: months[0].start } } }),
  ]);

  const reservationsByStatus = reservationsByStatusRaw.reduce((acc, { status }) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const totalReservations = reservationsByStatusRaw.length;

  const revenueByMonth = months.map(({ label, start, end }) => ({
    month: label,
    revenue: sumAmount(revenueRows.filter((t) => t.createdAt >= start && t.createdAt < end)),
  }));

  const revenueByCategoryMap = revenueRows.reduce((acc, t) => {
    const category = (t.metadata && t.metadata.category) || 'General';
    acc[category] = (acc[category] || 0) + Number(t.amount || 0);
    return acc;
  }, {});
  const revenueByCategory = Object.entries(revenueByCategoryMap)
    .map(([category, amount]) => ({ category, amount: round2(amount) }))
    .sort((a, b) => b.amount - a.amount);

  const monthlyGrowth = months.map(({ label, start, end }, idx) => {
    const count = userRows.filter((u) => u.createdAt >= start && u.createdAt < end).length;
    const prevCount =
      idx === 0
        ? 0
        : userRows.filter((u) => u.createdAt >= months[idx - 1].start && u.createdAt < months[idx - 1].end)
            .length;
    return { month: label, newUsers: count, growth: calculateGrowth(count, prevCount) };
  });

  return {
    registeredUsers,
    activeUsers,
    hotels: hotelsCount,
    places: placesCount,
    transports: transportsCount,
    reservations: { total: totalReservations, byStatus: reservationsByStatus },
    revenueByMonth,
    revenueByCategory,
    reservationsByDestination: topDestinations,
    topHotels,
    topPlaces,
    monthlyGrowth,
  };
};

module.exports = {
  BOOKING_STATUSES,
  getSettings,
  updateSettings,
  getDashboard,
  getFinances,
  getTransactions,
  listPaymentMethods,
  createPaymentMethod,
  deletePaymentMethod,
  getRecentActivity,
  getAlerts,
  getStatistics,
};
