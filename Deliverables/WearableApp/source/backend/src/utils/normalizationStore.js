/**
 * src/utils/normalizationStore.js
 * -----------------------------------------------------------------------
 * Persiste/lee los parámetros de normalización usados durante el
 * entrenamiento de un modelo (ej. valores máximos usados para escalar
 * features a 0-1), guardándolos como `normalization.json` junto al
 * `model.json` correspondiente.
 *
 * Esto es lo que permite que entrenamiento e inferencia usen EXACTAMENTE
 * el mismo procedimiento de normalización: el script de entrenamiento
 * guarda aquí los valores que calculó, y aiService.js los vuelve a leer
 * antes de predecir, en vez de asumir/hardcodear un valor distinto.
 * -----------------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');

/**
 * @param {string} modelDir - carpeta donde vive el model.json (NO el archivo).
 * @param {object} data - parámetros de normalización a guardar (deben ser JSON-serializables).
 */
const saveNormalization = (modelDir, data) => {
  fs.mkdirSync(modelDir, { recursive: true });
  const filePath = path.join(modelDir, 'normalization.json');
  fs.writeFileSync(filePath, JSON.stringify({ ...data, savedAt: new Date().toISOString() }, null, 2));
  return filePath;
};

/**
 * @param {string} modelDir - carpeta donde vive el model.json.
 * @returns {object|null} los parámetros guardados, o null si el archivo no existe.
 */
const loadNormalization = (modelDir) => {
  const filePath = path.join(modelDir, 'normalization.json');
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

module.exports = { saveNormalization, loadNormalization };
