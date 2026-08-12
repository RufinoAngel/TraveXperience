/**
 * Simulation/generate_synthetic_itineraries.js
 * -----------------------------------------------------------------------
 * Lógica de datos SINTÉTICOS para el modelo de predicción de presupuesto.
 *
 * Antes vivía enterrada dentro de scripts/trainBudgetModel.js. Se extrajo
 * aquí para que:
 *   1. Quede documentada como una decisión de diseño explícita (no un
 *      detalle escondido de implementación).
 *   2. Se pueda auditar/ajustar sin tocar el script de entrenamiento.
 *   3. Sea reutilizable desde otros lugares (ej. notebooks, tests).
 *
 * Se activa solo cuando hay menos de MIN_REAL_SAMPLES itinerarios reales
 * en la base de datos (ver Simulation/simulation_rules.md para el
 * detalle completo de la regla y sus rangos).
 * -----------------------------------------------------------------------
 */

const MIN_REAL_SAMPLES = 30;

const DURATION_MIN_DAYS = 1;
const DURATION_MAX_DAYS = 14;
const ACTIVITIES_MIN = 0;
const ACTIVITIES_MAX = 9;
const BUDGET_PER_DAY = 650; // MXN
const BUDGET_PER_ACTIVITY = 200; // MXN
const NOISE_RANGE = 400; // ± MXN
const MIN_BUDGET_FLOOR = 300; // MXN, nunca por debajo de esto

/**
 * Genera `count` itinerarios sintéticos plausibles con la regla:
 *   presupuesto ≈ duracionDias * 650 + numActividades * 200 ± ruido
 *
 * @param {number} count
 * @returns {{durationDays: number, numActivities: number, budget: number}[]}
 */
const generateSyntheticItineraries = (count) => {
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const durationDays =
      DURATION_MIN_DAYS + Math.floor(Math.random() * (DURATION_MAX_DAYS - DURATION_MIN_DAYS + 1));
    const numActivities = ACTIVITIES_MIN + Math.floor(Math.random() * (ACTIVITIES_MAX - ACTIVITIES_MIN + 1));
    const noise = Math.random() * NOISE_RANGE - NOISE_RANGE / 2;
    const budget = durationDays * BUDGET_PER_DAY + numActivities * BUDGET_PER_ACTIVITY + noise;
    rows.push({ durationDays, numActivities, budget: Math.max(budget, MIN_BUDGET_FLOOR) });
  }
  return rows;
};

module.exports = {
  MIN_REAL_SAMPLES,
  generateSyntheticItineraries,
};
