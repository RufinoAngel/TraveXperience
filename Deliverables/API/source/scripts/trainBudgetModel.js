/**
 * scripts/trainBudgetModel.js
 * -----------------------------------------------------------------------
 * Entrena el modelo de PREDICCIÓN DE PRESUPUESTO (regresión simple) y lo
 * exporta en formato TensorFlow.js a la ruta que espera aiService.js
 * (AI_MODEL_BUDGET_PATH en .env).
 *
 * Features de entrada: [duracionEnDias, numeroDeActividades]
 * Salida: presupuesto estimado (MXN)
 *
 * Fuente de datos: itinerarios ya guardados en MySQL (status distinto de
 * "borrador"), para aprender de viajes reales. Si aún no hay suficientes
 * itinerarios reales, cae a datos sintéticos razonables para poder
 * generar un modelo inicial mientras se junta información real.
 *
 * Uso:
 *   node scripts/trainBudgetModel.js
 * -----------------------------------------------------------------------
 */

require('dotenv').config();

// Mismo fallback que src/services/aiService.js: intenta el binario nativo
// (más rápido para entrenar) y si no compiló, usa la versión 100% JS.
let tf;
try {
  // eslint-disable-next-line global-require
  tf = require('@tensorflow/tfjs-node');
} catch (error) {
  // eslint-disable-next-line global-require
  tf = require('@tensorflow/tfjs');
}

const path = require('path');
const { sequelize } = require('../src/config/mysql');
const Itinerary = require('../src/models/mysql/Itinerary');
const logger = require('../src/utils/logger');

const MIN_REAL_SAMPLES = 30; // por debajo de esto, se completa con datos sintéticos

/** Genera ejemplos sintéticos plausibles mientras no hay suficiente historial real. */
const generateSyntheticData = (count) => {
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const durationDays = 1 + Math.floor(Math.random() * 14); // 1 a 14 días
    const numActivities = Math.floor(Math.random() * 10); // 0 a 9 actividades
    // Regla base + ruido: ~$650 MXN/día + $200 por actividad planeada
    const budget = durationDays * 650 + numActivities * 200 + (Math.random() * 400 - 200);
    rows.push({ durationDays, numActivities, budget: Math.max(budget, 300) });
  }
  return rows;
};

const loadRealData = async () => {
  const itineraries = await Itinerary.findAll({
    where: {},
    raw: true,
  });

  return itineraries
    .filter((it) => it.estimatedBudget && it.startDate && it.endDate)
    .map((it) => {
      const durationDays =
        (new Date(it.endDate) - new Date(it.startDate)) / (1000 * 60 * 60 * 24) + 1;
      const numActivities = Array.isArray(it.itineraryDetails) ? it.itineraryDetails.length : 0;
      return { durationDays, numActivities, budget: Number(it.estimatedBudget) };
    });
};

const buildModel = () => {
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [2], units: 16, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1 })); // salida: presupuesto (regresión, sin activación)
  model.compile({ optimizer: tf.train.adam(0.01), loss: 'meanSquaredError' });
  return model;
};

const train = async () => {
  try {
    await sequelize.authenticate();

    let data = await loadRealData();
    logger.info(`Itinerarios reales utilizables: ${data.length}`);

    if (data.length < MIN_REAL_SAMPLES) {
      const needed = MIN_REAL_SAMPLES * 3 - data.length;
      logger.warn(
        `Pocos datos reales (${data.length}). Se completan ${needed} ejemplos sintéticos para el entrenamiento inicial.`
      );
      data = data.concat(generateSyntheticData(needed));
    }

    const xs = tf.tensor2d(data.map((d) => [d.durationDays, d.numActivities]));
    const ys = tf.tensor2d(data.map((d) => [d.budget]));

    // Normalización simple (mejora la convergencia)
    const xMax = xs.max(0);
    const xsNorm = xs.div(xMax);

    const model = buildModel();
    await model.fit(xsNorm, ys, {
      epochs: 80,
      batchSize: 16,
      shuffle: true,
      verbose: 0,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 20 === 0) logger.info(`  epoch ${epoch} - loss: ${logs.loss.toFixed(2)}`);
        },
      },
    });

    const outputPath = path.resolve(process.env.AI_MODEL_BUDGET_PATH, '..');
    await model.save(`file://${outputPath}`);
    logger.info(`✅ Modelo de presupuesto guardado en: ${outputPath}`);

    tf.dispose([xs, ys, xsNorm, xMax]);
  } catch (error) {
    logger.error(`❌ Error entrenando el modelo de presupuesto: ${error.message}`);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

train();
