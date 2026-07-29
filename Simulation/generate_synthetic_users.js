/**
 * Simulation/generate_synthetic_users.js
 * -----------------------------------------------------------------------
 * Lógica de datos SINTÉTICOS para el modelo de clustering de viajeros.
 *
 * Antes vivía enterrada dentro de scripts/trainClusteringModel.js. Se
 * extrajo aquí por las mismas razones que
 * generate_synthetic_itineraries.js (ver ese archivo y
 * simulation_rules.md).
 *
 * Se activa solo cuando hay menos de MIN_REAL_USERS usuarios reales con
 * `travelPreferences` declarado.
 * -----------------------------------------------------------------------
 */

const MIN_REAL_USERS = 40;

const BUDGET_MIN = 1000; // MXN
const BUDGET_MAX_ADDITIONAL = 15000; // MXN (se suma a BUDGET_MIN)
const BUDGET_NORMALIZATION_CAP = 20000; // tope usado para normalizar a 0-1
const AGE_MIN = 18;
const AGE_MAX_ADDITIONAL = 55; // se suma a AGE_MIN
const AGE_NORMALIZATION_CAP = 80; // tope usado para normalizar a 0-1

/**
 * Convierte preferencias crudas en un vector numérico normalizado 0-1,
 * con defaults razonables si algún campo no viene.
 * Debe coincidir EXACTAMENTE con la función homónima usada en
 * scripts/trainClusteringModel.js y en src/services/aiService.js al
 * momento de hacer inferencia, para que entrenamiento e inferencia usen
 * la misma codificación de features.
 *
 * @param {object} prefs
 * @returns {number[]} [presupuestoNormalizado, edadNormalizada, interesAventura, interesCultura, viajaSolo]
 */
const toFeatureVector = (prefs = {}) => [
  Math.min((prefs.avgBudget || 5000) / BUDGET_NORMALIZATION_CAP, 1),
  Math.min((prefs.age || 30) / AGE_NORMALIZATION_CAP, 1),
  prefs.interesAventura ? 1 : 0,
  prefs.interesCultura ? 1 : 0,
  prefs.viajaSolo ? 1 : 0,
];

/**
 * Genera `count` usuarios sintéticos plausibles (ya como vector de
 * features, listos para entrenar).
 *
 * @param {number} count
 * @returns {number[][]}
 */
const generateSyntheticUsers = (count) => {
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    rows.push(
      toFeatureVector({
        avgBudget: BUDGET_MIN + Math.random() * BUDGET_MAX_ADDITIONAL,
        age: AGE_MIN + Math.random() * AGE_MAX_ADDITIONAL,
        interesAventura: Math.random() > 0.5,
        interesCultura: Math.random() > 0.5,
        viajaSolo: Math.random() > 0.6,
      })
    );
  }
  return rows;
};

module.exports = {
  MIN_REAL_USERS,
  toFeatureVector,
  generateSyntheticUsers,
};
