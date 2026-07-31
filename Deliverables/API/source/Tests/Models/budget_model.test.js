/**
 * tests/Models/budget_model.test.js
 * -----------------------------------------------------------------------
 * Verifica que el modelo serializado de presupuesto
 * (src/ai-models/budget-prediction-model/) cargue correctamente y que
 * sus predicciones sean coherentes (siempre positivas, dentro de un
 * rango lógico).
 * -----------------------------------------------------------------------
 */

const path = require('path');
const tf = require('@tensorflow/tfjs');
const { loadSerializedModel } = require('../../src/utils/loadSerializedModel');

const MODEL_PATH = path.resolve(__dirname, '../../src/ai-models/budget-prediction-model/model.json');

describe('Modelo de presupuesto (regresión) — src/ai-models/budget-prediction-model', () => {
  let model;

  beforeAll(async () => {
    model = await loadSerializedModel(tf, MODEL_PATH);
  });

  it('debe cargar sin errores', () => {
    expect(model).toBeDefined();
  });

  it('nunca debe predecir un presupuesto negativo', async () => {
    // Nota: el modelo se entrenó con features normalizadas (x / xMax del
    // batch de entrenamiento). Aquí se prueba con valores ya en el rango
    // 0-1 esperado por la capa de entrada.
    const casos = [
      [0.1, 0.0], // viaje corto, sin actividades
      [0.5, 0.5], // viaje medio
      [1.0, 1.0], // viaje largo, muchas actividades
    ];

    const input = tf.tensor2d(casos);
    const preds = model.predict(input);
    const valores = await preds.data();

    valores.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
    });
  });

  it('un viaje más largo con más actividades no debe predecir un presupuesto absurdamente menor que uno corto', async () => {
    const corto = tf.tensor2d([[0.05, 0.0]]);
    const largo = tf.tensor2d([[1.0, 1.0]]);

    const predCorto = (await model.predict(corto).data())[0];
    const predLargo = (await model.predict(largo).data())[0];

    // No se exige monotonía estricta (la red puede aprender matices),
    // pero un viaje largo no debería salir muy por debajo de uno corto.
    expect(predLargo).toBeGreaterThan(predCorto * 0.5);
  });
});
