/**
 * scripts/analyzeClusteringModel.js
 * -----------------------------------------------------------------------
 * Corrige/valida src/config/travelerClusters.js con evidencia real en
 * lugar de suposiciones.
 *
 * CONTEXTO DEL PROBLEMA (ver reporte de entrega anterior y los comentarios
 * en src/config/travelerClusters.js): el clasificador de
 * src/ai-models/clustering-model/ se entrenó contra etiquetas de k-means
 * cuyos centroides NUNCA se guardaron, y la función que generaba/normalizaba
 * las features de entrenamiento (Simulation/generate_synthetic_users.js)
 * no forma parte de este repositorio. Es decir: no existe ningún artefacto
 * que diga "el índice 2 es Cultural". k-means tampoco garantiza que un
 * índice tenga el mismo significado entre corridas distintas.
 *
 * LO QUE SÍ TENEMOS: la red clasificadora YA ENTRENADA (model.json +
 * weights.bin), que es una función determinística input->output. Aunque
 * no podamos recuperar los centroides originales, SÍ podemos observar
 * empíricamente qué aprendió esa red concreta, alimentándola con vectores
 * de prueba en todo el espacio de entrada [0,1]^5 y viendo qué cluster
 * gana en cada región. Esto es un análisis de sensibilidad/frontera de
 * decisión, no una invención de datos: el resultado depende 100% de los
 * pesos reales guardados en el modelo.
 *
 * Orden de features (igual que aiController.js y trainClusteringModel.js):
 *   [budgetAverage, age, adventureInterest, cultureInterest, soloTravelPreference]
 *   todas normalizadas 0-1.
 *
 * Uso:
 *   node scripts/analyzeClusteringModel.js
 * -----------------------------------------------------------------------
 */

require('dotenv').config();

let tf;
try {
  // eslint-disable-next-line global-require
  tf = require('@tensorflow/tfjs-node');
} catch (error) {
  // eslint-disable-next-line global-require
  tf = require('@tensorflow/tfjs');
}

const path = require('path');
const { loadSerializedModel } = require('../src/utils/loadSerializedModel');

const FEATURE_NAMES = ['budget', 'age', 'adventure', 'culture', 'solo'];

const predict = async (model, vec) => {
  const t = tf.tensor2d([vec]);
  const pred = model.predict(t);
  const probs = Array.from(await pred.data());
  tf.dispose([t, pred]);
  return probs;
};

const winner = (probs) => probs.indexOf(Math.max(...probs));

const analyze = async () => {
  const clusteringPath = path.resolve(process.env.AI_MODEL_CLUSTERING_PATH);
  let model;
  try {
    model = await tf.loadLayersModel(`file://${clusteringPath}`);
  } catch (e) {
    model = await loadSerializedModel(tf, clusteringPath);
  }

  const levels = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

  // 1) Región adventure=0, culture=0: ¿alguna vez cambia de cluster al
  //    variar budget/age/solo?
  const region00 = new Set();
  for (const solo of [0, 1]) {
    for (const b of levels) {
      for (const a of levels) {
        const probs = await predict(model, [b, a, 0, 0, solo]);
        region00.add(winner(probs));
      }
    }
  }
  console.log(
    `Región adventure=0, culture=0 -> cluster(es) observado(s): [${[...region00].join(', ')}]` +
      (region00.size === 1 ? ' (constante, budget/age/solo no importan aquí)' : ' (¡varía! revisar)')
  );

  // 2) Región adventure=1: ¿siempre domina el mismo cluster sin importar el resto?
  const region1 = new Set();
  for (const cult of [0, 1]) {
    for (const solo of [0, 1]) {
      for (const b of [0, 0.5, 1]) {
        for (const a of [0, 0.5, 1]) {
          const probs = await predict(model, [b, a, 1, cult, solo]);
          region1.add(winner(probs));
        }
      }
    }
  }
  console.log(
    `Región adventure=1 -> cluster(es) observado(s): [${[...region1].join(', ')}]` +
      (region1.size === 1 ? ' (constante, adventure domina sobre todo lo demás)' : ' (¡varía! revisar)')
  );

  // 3) Frontera adventure=0, culture=1: solo bajo vs alto
  console.log('Frontera adventure=0, culture=1 (barrido de "solo"):');
  for (const solo of levels) {
    const probs = await predict(model, [0.5, 0.5, 0, 1, solo]);
    console.log(`  solo=${solo.toFixed(1)} -> cluster=${winner(probs)} probs=[${probs.map((p) => p.toFixed(3))}]`);
  }

  console.log('\nUsar esta salida para confirmar/actualizar src/config/travelerClusters.js.');
  console.log('Re-ejecutar este script cada vez que se reentrene el modelo de clustering.');
};

analyze()
  .catch((err) => {
    console.error(`❌ Error analizando el modelo de clustering: ${err.message}`);
    process.exitCode = 1;
  });
