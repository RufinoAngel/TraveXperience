/**
 * src/utils/saveSerializedModel.js
 * -----------------------------------------------------------------------
 * Contraparte de src/utils/loadSerializedModel.js. `model.save('file://...')`
 * solo funciona si @tensorflow/tfjs-node está compilado (es quien registra
 * el manejador de guardado para el esquema "file://"). Si el proyecto cae
 * al fallback de @tensorflow/tfjs puro (por ejemplo porque tfjs-node no
 * compiló en esta máquina/CI), `model.save('file://...')` lanza:
 *   "Cannot find any save handlers for URL 'file://...'"
 *
 * Este helper implementa un IOHandler manual que escribe exactamente el
 * mismo formato (model.json + weights.bin) que loadSerializedModel.js ya
 * sabe leer, así que los scripts de entrenamiento pueden guardar el
 * modelo aunque tfjs-node no esté disponible.
 *
 * Uso:
 *   const { saveSerializedModel } = require('../src/utils/saveSerializedModel');
 *   await saveSerializedModel(model, outputDir); // outputDir = carpeta, no model.json
 * -----------------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');

const saveSerializedModel = async (model, outputDir) => {
  fs.mkdirSync(outputDir, { recursive: true });

  const handler = {
    save: async (modelArtifacts) => {
      const weightsFileName = 'weights.bin';

      const weightData = Buffer.from(modelArtifacts.weightData);
      fs.writeFileSync(path.join(outputDir, weightsFileName), weightData);

      const modelJson = {
        modelTopology: modelArtifacts.modelTopology,
        format: modelArtifacts.format,
        generatedBy: modelArtifacts.generatedBy,
        convertedBy: modelArtifacts.convertedBy,
        weightsManifest: [
          {
            paths: [weightsFileName],
            weights: modelArtifacts.weightSpecs,
          },
        ],
      };
      fs.writeFileSync(path.join(outputDir, 'model.json'), JSON.stringify(modelJson));

      return {
        modelArtifactsInfo: {
          dateSaved: new Date(),
          modelTopologyType: 'JSON',
          weightDataBytes: weightData.byteLength,
        },
      };
    },
  };

  return model.save(handler);
};

module.exports = { saveSerializedModel };
