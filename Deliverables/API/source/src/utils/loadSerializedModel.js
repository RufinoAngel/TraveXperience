/**
 * src/utils/loadSerializedModel.js
 * -----------------------------------------------------------------------
 * aiService.js usa @tensorflow/tfjs-node (con fallback a @tensorflow/tfjs)
 * para cargar modelos con tf.loadLayersModel('file://...'). Esa ruta de
 * carga solo existe si tfjs-node está compilado. Este helper permite
 * cargar el mismo model.json + weights.bin usando SOLO tfjs puro (útil en
 * este entorno de pruebas, o en cualquier máquina donde tfjs-node no
 * haya compilado), mediante un IOHandler manual.
 * -----------------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');

const loadSerializedModel = async (tf, modelJsonPath) => {
  const dir = path.dirname(modelJsonPath);
  const modelJson = JSON.parse(fs.readFileSync(modelJsonPath, 'utf-8'));
  const weightsPath = path.join(dir, modelJson.weightsManifest[0].paths[0]);
  const weightsRaw = fs.readFileSync(weightsPath);
  // fs.readFileSync devuelve un Buffer cuyo .buffer puede ser un
  // ArrayBuffer más grande que los datos reales (pool interno de Node).
  // Hay que recortarlo exactamente al rango real (byteOffset..length).
  const weightData = weightsRaw.buffer.slice(weightsRaw.byteOffset, weightsRaw.byteOffset + weightsRaw.byteLength);

  const handler = {
    load: async () => ({
      modelTopology: modelJson.modelTopology,
      weightSpecs: modelJson.weightsManifest[0].weights,
      weightData,
      format: modelJson.format,
      generatedBy: modelJson.generatedBy,
      convertedBy: modelJson.convertedBy,
    }),
  };

  return tf.loadLayersModel(handler);
};

module.exports = { loadSerializedModel };
