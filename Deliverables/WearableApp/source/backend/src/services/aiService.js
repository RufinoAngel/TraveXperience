/**
 * services/aiService.js
 * -----------------------------------------------------------------------
 * Servicio de Inteligencia Artificial. Carga en memoria los modelos
 * exportados en formato TensorFlow.js (model.json + shard*.bin) y expone
 * funciones de inferencia para:
 *   1. Agrupamiento de viajeros (clustering) -> Smart Recommendations.
 *   2. Predicción de presupuesto de viaje (regresión).
 *
 * Los modelos se cargan UNA sola vez al iniciar el servidor (ver index.js)
 * y se mantienen en memoria para servir inferencias de baja latencia.
 *
 * Carga de TensorFlow con fallback:
 * @tensorflow/tfjs-node usa un binario nativo (más rápido), pero requiere
 * compilar con node-gyp/Visual Studio en Windows y falla en npm install si
 * no está instalado ese toolchain de C++. Como es una dependencia opcional
 * (ver package.json -> optionalDependencies), npm no truena la instalación
 * si no logra compilarla: aquí simplemente detectamos si quedó disponible
 * y, si no, caemos a @tensorflow/tfjs (100% JavaScript, sin binarios
 * nativos, algo más lento pero funciona en cualquier equipo sin setup extra).
 * -----------------------------------------------------------------------
 */

let tf;
let usingNativeBackend = true;
try {
  // eslint-disable-next-line global-require
  tf = require('@tensorflow/tfjs-node');
} catch (error) {
  // eslint-disable-next-line global-require
  tf = require('@tensorflow/tfjs');
  usingNativeBackend = false;
}

const path = require('path');
const logger = require('../utils/logger');
const { loadSerializedModel } = require('../utils/loadSerializedModel');
const { loadNormalization } = require('../utils/normalizationStore');

logger.info(
  usingNativeBackend
    ? '🧠 TensorFlow: usando @tensorflow/tfjs-node (binario nativo).'
    : '🧠 TensorFlow: @tensorflow/tfjs-node no disponible, usando @tensorflow/tfjs (JS puro).'
);

let clusteringModel = null;
let budgetModel = null;
// Parámetros de normalización guardados por scripts/trainBudgetModel.js
// (ver src/utils/normalizationStore.js). Se cargan una vez al iniciar el
// backend, junto con el modelo, para que la inferencia use EXACTAMENTE el
// mismo procedimiento que se usó durante el entrenamiento.
let budgetNormalization = null;

/**
 * Carga ambos modelos desde disco. Debe llamarse una vez al arrancar el servidor.
 */
const loadModel = async (modelJsonPath) => {
  try {
    // Camino rápido: requiere @tensorflow/tfjs-node compilado, que es
    // quien registra el manejador de carga para el esquema "file://".
    return await tf.loadLayersModel(`file://${modelJsonPath}`);
  } catch (error) {
    // Sin tfjs-node, @tensorflow/tfjs puro no reconoce "file://" y termina
    // intentando usar fetch() sobre esa URL ("fetch failed"). Fallback: leer
    // model.json + weights.bin a mano con el mismo IOHandler que usan los
    // scripts de entrenamiento.
    return loadSerializedModel(tf, modelJsonPath);
  }
};

const loadModels = async () => {
  try {
    const clusteringPath = path.resolve(process.env.AI_MODEL_CLUSTERING_PATH);
    const budgetPath = path.resolve(process.env.AI_MODEL_BUDGET_PATH);

    clusteringModel = await loadModel(clusteringPath);
    logger.info('🧠 Modelo de agrupamiento de viajeros cargado.');

    budgetModel = await loadModel(budgetPath);
    logger.info('🧠 Modelo de predicción de presupuesto cargado.');

    budgetNormalization = loadNormalization(path.dirname(budgetPath));
    if (budgetNormalization) {
      logger.info(
        `🧠 Normalización de presupuesto cargada (maxDurationDays=${budgetNormalization.maxDurationDays}, maxNumActivities=${budgetNormalization.maxNumActivities}).`
      );
    } else {
      // No se detiene el arranque: se registra como advertencia y
      // predictBudget() rechazará predicciones hasta que exista este
      // archivo (evita predecir con features sin normalizar, que era el
      // bug original).
      logger.warn(
        '⚠️  No se encontró normalization.json junto al modelo de presupuesto. ' +
          'Ejecuta scripts/trainBudgetModel.js para regenerarlo antes de usar predicciones automáticas.'
      );
    }
  } catch (error) {
    // No se detiene el servidor si los modelos no existen aún: se registra
    // el aviso y las rutas de IA responderán 503 hasta que estén disponibles.
    logger.warn(`⚠️  No se pudieron cargar los modelos de IA: ${error.message}`);
  }
};

/**
 * Ejecuta el modelo de clustering sobre un vector de características del viajero.
 * @param {number[]} features - Vector normalizado (ej. [presupuesto, edad, interesAventura, ...])
 * @returns {Promise<number[]>} distribución de probabilidad sobre los clusters
 */
const predictTravelerCluster = async (features) => {
  if (!clusteringModel) {
    throw new Error('El modelo de agrupamiento no está cargado todavía.');
  }
  const inputTensor = tf.tensor2d([features]);
  const prediction = clusteringModel.predict(inputTensor);
  const result = await prediction.data();
  tf.dispose([inputTensor, prediction]);
  return Array.from(result);
};

/**
 * Ejecuta el modelo de predicción de presupuesto.
 *
 * IMPORTANTE: recibe las features EN CRUDO ([duracionEnDias,
 * numeroDeActividades], sin normalizar) — misma forma en que ya las
 * construye itineraryController.js. La normalización (dividir entre los
 * máximos usados durante el entrenamiento, ver scripts/trainBudgetModel.js)
 * se aplica aquí adentro, usando los parámetros persistidos en
 * normalization.json, para que entrenamiento e inferencia queden
 * garantizadamente consistentes.
 *
 * @param {number[]} features - [duracionEnDias, numeroDeActividades] SIN normalizar.
 * @returns {Promise<number>} presupuesto estimado
 */
const predictBudget = async (features) => {
  if (!budgetModel) {
    throw new Error('El modelo de predicción de presupuesto no está cargado todavía.');
  }
  if (!budgetNormalization) {
    throw new Error(
      'No hay parámetros de normalización para el modelo de presupuesto (normalization.json no encontrado). ' +
        'Ejecuta scripts/trainBudgetModel.js para regenerarlo.'
    );
  }
  if (!Array.isArray(features) || features.length !== 2 || features.some((v) => !Number.isFinite(v))) {
    throw new Error('Features inválidas para el modelo de presupuesto: se esperan [duracionEnDias, numeroDeActividades].');
  }

  const { maxDurationDays, maxNumActivities } = budgetNormalization;
  const normalizedFeatures = [
    maxDurationDays ? features[0] / maxDurationDays : features[0],
    maxNumActivities ? features[1] / maxNumActivities : features[1],
  ];

  const inputTensor = tf.tensor2d([normalizedFeatures]);
  const prediction = budgetModel.predict(inputTensor);
  const result = await prediction.data();
  tf.dispose([inputTensor, prediction]);
  return Math.max(0, result[0]);
};

const isReady = () => Boolean(clusteringModel && budgetModel && budgetNormalization);

// Los endpoints de tipo de viajero solo dependen del modelo de clustering,
// no del de presupuesto: se expone una bandera separada para no bloquear
// esa función si algún día solo uno de los dos modelos está disponible.
const isClusteringReady = () => Boolean(clusteringModel);

module.exports = {
  loadModels,
  predictTravelerCluster,
  predictBudget,
  isReady,
  isClusteringReady,
};
