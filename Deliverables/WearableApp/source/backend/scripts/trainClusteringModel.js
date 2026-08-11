/**
 * scripts/trainClusteringModel.js
 * -----------------------------------------------------------------------
 * Entrena el modelo de AGRUPAMIENTO DE VIAJEROS y lo exporta en formato
 * TensorFlow.js a la ruta que espera aiService.js (AI_MODEL_CLUSTERING_PATH).
 *
 * Clustering real (k-means) no es una red neuronal exportable como
 * model.json, así que el proceso tiene DOS pasos:
 *
 *   1) Se corre un k-means simple (implementado aquí, sin dependencias
 *      extra) sobre las preferencias de viaje de los usuarios
 *      (User.travelPreferences) para etiquetar a cada uno con un cluster.
 *   2) Se entrena una red neuronal CLASIFICADORA pequeña que aprende
 *      "dadas estas preferencias, predice el cluster" — esa red es la
 *      que realmente se exporta, para que la inferencia en producción
 *      sea instantánea (no se vuelve a correr k-means en cada request).
 *
 * Features de entrada (normalizadas 0-1): [presupuestoPromedio, edad,
 * interesAventura, interesCultura, prefiereViajarSolo]
 * Salida: distribución de probabilidad sobre N_CLUSTERS
 *
 * Uso:
 *   node scripts/trainClusteringModel.js
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
const User = require('../src/models/mysql/User');
const logger = require('../src/utils/logger');
const {
  MIN_REAL_USERS,
  toFeatureVector,
  generateSyntheticUsers,
} = require('../Simulation/generate_synthetic_users');
const { saveSerializedModel } = require('../src/utils/saveSerializedModel');
const { saveNormalization } = require('../src/utils/normalizationStore');

const N_CLUSTERS = 4; // ej. "aventurero", "cultural", "relax", "familiar"

/** k-means minimalista en JS puro (sin dependencias) sobre arrays de vectores. */
const kMeans = (vectors, k, iterations = 50) => {
  const dims = vectors[0].length;
  // Inicializa centroides con k vectores aleatorios del propio dataset
  let centroids = vectors
    .slice()
    .sort(() => Math.random() - 0.5)
    .slice(0, k)
    .map((v) => [...v]);

  let labels = new Array(vectors.length).fill(0);

  const distance = (a, b) => Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));

  for (let iter = 0; iter < iterations; iter += 1) {
    // Asignación: cada vector al centroide más cercano
    labels = vectors.map((v) => {
      let best = 0;
      let bestDist = Infinity;
      centroids.forEach((c, ci) => {
        const d = distance(v, c);
        if (d < bestDist) {
          bestDist = d;
          best = ci;
        }
      });
      return best;
    });

    // Recalcula centroides como el promedio de sus miembros
    const sums = Array.from({ length: k }, () => new Array(dims).fill(0));
    const counts = new Array(k).fill(0);
    vectors.forEach((v, i) => {
      const c = labels[i];
      counts[c] += 1;
      v.forEach((val, d) => {
        sums[c][d] += val;
      });
    });
    centroids = sums.map((sum, c) => (counts[c] > 0 ? sum.map((s) => s / counts[c]) : centroids[c]));
  }

  return { labels, centroids };
};

const buildClassifier = (inputDim, numClasses) => {
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [inputDim], units: 16, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 12, activation: 'relu' }));
  model.add(tf.layers.dense({ units: numClasses, activation: 'softmax' }));
  model.compile({ optimizer: tf.train.adam(0.01), loss: 'categoricalCrossentropy', metrics: ['accuracy'] });
  return model;
};

const oneHot = (label, numClasses) =>
  Array.from({ length: numClasses }, (_, i) => (i === label ? 1 : 0));

const train = async () => {
  try {
    await sequelize.authenticate();

    const users = await User.findAll({ raw: true });
    let vectors = users
      .map((u) => u.travelPreferences)
      .filter((prefs) => prefs && Object.keys(prefs).length > 0)
      .map(toFeatureVector);

    logger.info(`Usuarios reales con preferencias utilizables: ${vectors.length}`);

    if (vectors.length < MIN_REAL_USERS) {
      const needed = MIN_REAL_USERS * 2 - vectors.length;
      logger.warn(
        `Pocos usuarios reales (${vectors.length}). Se completan ${needed} usuarios sintéticos para el entrenamiento inicial.`
      );
      vectors = vectors.concat(generateSyntheticUsers(needed));
    }

    // Paso 1: k-means para etiquetar (offline, no se exporta)
    const { labels } = kMeans(vectors, N_CLUSTERS);
    logger.info(`Distribución de clusters: ${JSON.stringify(
      labels.reduce((acc, l) => ({ ...acc, [l]: (acc[l] || 0) + 1 }), {})
    )}`);

    // NOTA (misma clase de bug que se corrigió en trainBudgetModel.js):
    // `toFeatureVector` (Simulation/generate_synthetic_users.js) es quien
    // normaliza [presupuestoPromedio, edad, interesAventura, interesCultura,
    // viajaSolo] a 0-1 ANTES de este punto, pero ese archivo no forma parte
    // de este repositorio, así que sus constantes de normalización (ej. edad
    // máxima, presupuesto máximo) no se pueden inspeccionar ni persistir
    // desde aquí. Se documenta el contrato esperado igualmente para que
    // aiController.js (endpoint /ai/traveler-type) y cualquier futuro
    // reentrenamiento sepan qué se espera como entrada.
    saveNormalization(path.resolve(process.env.AI_MODEL_CLUSTERING_PATH, '..'), {
      features: ['budgetAverage', 'age', 'adventureInterest', 'cultureInterest', 'soloTravelPreference'],
      method: 'normalizado 0-1 por toFeatureVector() (Simulation/generate_synthetic_users.js, no incluido en este repo)',
      note:
        'Este archivo documenta el CONTRATO esperado de entrada del modelo, no reemplaza a toFeatureVector(). ' +
        'Si toFeatureVector cambia su forma de normalizar, hay que actualizar esto y src/controllers/aiController.js a mano.',
    });

    // Paso 2: entrenar el clasificador que SÍ se exporta
    const xs = tf.tensor2d(vectors);
    const ys = tf.tensor2d(labels.map((l) => oneHot(l, N_CLUSTERS)));

    const model = buildClassifier(vectors[0].length, N_CLUSTERS);
    await model.fit(xs, ys, {
      epochs: 100,
      batchSize: 16,
      shuffle: true,
      verbose: 0,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 25 === 0) {
            logger.info(`  epoch ${epoch} - loss: ${logs.loss.toFixed(3)} - acc: ${logs.acc?.toFixed(3)}`);
          }
        },
      },
    });

    const outputPath = path.resolve(process.env.AI_MODEL_CLUSTERING_PATH, '..');
    try {
      await model.save(`file://${outputPath}`);
    } catch (saveError) {
      // tfjs-node no compiló (o no está instalado) en esta máquina, así que
      // el esquema "file://" no tiene manejador registrado. Fallback puro-JS.
      logger.warn(`Guardado nativo no disponible (${saveError.message}). Usando fallback puro-JS.`);
      await saveSerializedModel(model, outputPath);
    }
    logger.info(`✅ Modelo de clustering guardado en: ${outputPath}`);

    tf.dispose([xs, ys]);
  } catch (error) {
    logger.error(`❌ Error entrenando el modelo de clustering: ${error.message}`);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

train();
