/**
 * src/utils/datasetSplitter.js
 * -----------------------------------------------------------------------
 * Utilidad pura para dividir un dataset en train/validation/test.
 * Extraída como módulo independiente para que:
 *   1. El ETL real (DataBases/ETL/extract_training_data.js) la reutilice.
 *   2. Se pueda probar de forma aislada sin necesitar conexión a BD
 *      (ver tests/ETL/datasetSplitter.test.js).
 * -----------------------------------------------------------------------
 */

/**
 * Divide un arreglo en 3 particiones según las proporciones dadas.
 * No muta el arreglo original ni pierde/duplica elementos.
 *
 * @param {Array} data
 * @param {{train?: number, validation?: number, test?: number}} ratios
 * @returns {{train: Array, validation: Array, test: Array}}
 */
const splitDataset = (data, ratios = { train: 0.7, validation: 0.15, test: 0.15 }) => {
  const total = ratios.train + ratios.validation + ratios.test;
  if (Math.abs(total - 1) > 1e-6) {
    throw new Error(`Las proporciones deben sumar 1 (suman ${total}).`);
  }

  const shuffled = [...data]; // copia, no muta el original
  const trainEnd = Math.round(shuffled.length * ratios.train);
  const valEnd = trainEnd + Math.round(shuffled.length * ratios.validation);

  return {
    train: shuffled.slice(0, trainEnd),
    validation: shuffled.slice(trainEnd, valEnd),
    test: shuffled.slice(valEnd),
  };
};

module.exports = { splitDataset };
