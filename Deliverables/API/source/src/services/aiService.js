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

logger.info(
  usingNativeBackend
    ? '🧠 TensorFlow: usando @tensorflow/tfjs-node (binario nativo).'
    : '🧠 TensorFlow: @tensorflow/tfjs-node no disponible, usando @tensorflow/tfjs (JS puro).'
);

let clusteringModel = null;
let budgetModel = null;

/**
 * Carga ambos modelos desde disco. Debe llamarse una vez al arrancar el servidor.
 */
const loadModels = async () => {
  try {
    const clusteringPath = path.resolve(process.env.AI_MODEL_CLUSTERING_PATH);
    const budgetPath = path.resolve(process.env.AI_MODEL_BUDGET_PATH);

    clusteringModel = await tf.loadLayersModel(`file://${clusteringPath}`);
    logger.info('🧠 Modelo de agrupamiento de viajeros cargado.');

    budgetModel = await tf.loadLayersModel(`file://${budgetPath}`);
    logger.info('🧠 Modelo de predicción de presupuesto cargado.');
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
 * @param {number[]} features - Vector de características del itinerario/destino.
 * @returns {Promise<number>} presupuesto estimado
 */
const predictBudget = async (features) => {
  if (!budgetModel) {
    throw new Error('El modelo de predicción de presupuesto no está cargado todavía.');
  }
  const inputTensor = tf.tensor2d([features]);
  const prediction = budgetModel.predict(inputTensor);
  const result = await prediction.data();
  tf.dispose([inputTensor, prediction]);
  return result[0];
};

const isReady = () => Boolean(clusteringModel && budgetModel);

module.exports = { loadModels, predictTravelerCluster, predictBudget, isReady };
