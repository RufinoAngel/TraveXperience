/**
 * tests/Models/clustering_model.test.js
 * -----------------------------------------------------------------------
 * Verifica que el clasificador de clusters
 * (src/ai-models/clustering-model/) cargue correctamente y que sus
 * salidas sean una distribución de probabilidad válida.
 * -----------------------------------------------------------------------
 */

const path = require('path');
const tf = require('@tensorflow/tfjs');
const { loadSerializedModel } = require('../../src/utils/loadSerializedModel');

const MODEL_PATH = path.resolve(__dirname, '../../src/ai-models/clustering-model/model.json');
const N_CLUSTERS = 4;

describe('Modelo de clustering (clasificador) — src/ai-models/clustering-model', () => {
  let model;

  beforeAll(async () => {
    model = await loadSerializedModel(tf, MODEL_PATH);
  });

  it('debe cargar sin errores', () => {
    expect(model).toBeDefined();
  });

  it('las probabilidades de un usuario deben sumar ~1 (softmax bien formado)', async () => {
    // [presupuestoPromedio, edad, interesAventura, interesCultura, viajaSolo]
    const usuario = tf.tensor2d([[0.4, 0.35, 1, 0, 0]]);
    const pred = model.predict(usuario);
    const probs = await pred.data();

    const suma = Array.from(probs).reduce((a, b) => a + b, 0);
    expect(suma).toBeCloseTo(1, 2);
  });

  it('debe devolver exactamente N_CLUSTERS probabilidades', async () => {
    const usuario = tf.tensor2d([[0.2, 0.5, 0, 1, 1]]);
    const pred = model.predict(usuario);
    expect(pred.shape[1]).toBe(N_CLUSTERS);
  });

  it('el cluster asignado (argmax) debe ser un índice válido (0 a N_CLUSTERS-1)', async () => {
    const usuario = tf.tensor2d([[0.6, 0.2, 1, 1, 0]]);
    const pred = model.predict(usuario);
    const probs = await pred.data();
    const clusterAsignado = probs.indexOf(Math.max(...probs));

    expect(clusterAsignado).toBeGreaterThanOrEqual(0);
    expect(clusterAsignado).toBeLessThan(N_CLUSTERS);
  });
});
