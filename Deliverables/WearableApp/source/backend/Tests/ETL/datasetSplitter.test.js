/**
 * tests/ETL/datasetSplitter.test.js
 * -----------------------------------------------------------------------
 * Prueba la utilidad src/utils/datasetSplitter.js que usará (o ya usa)
 * DataBases/ETL/extract_training_data.js para dividir 70/15/15.
 * -----------------------------------------------------------------------
 */

const { splitDataset } = require('../../src/utils/datasetSplitter');

describe('splitDataset — división de datasets para el ETL', () => {
  const dataset = Array.from({ length: 100 }, (_, i) => ({ id: i }));

  it('no debe perder ni duplicar registros al dividir', () => {
    const { train, validation, test } = splitDataset(dataset);
    const totalIds = [...train, ...validation, ...test].map((d) => d.id);

    expect(totalIds.length).toBe(dataset.length);
    expect(new Set(totalIds).size).toBe(dataset.length); // sin duplicados
  });

  it('debe respetar aproximadamente las proporciones 70/15/15', () => {
    const { train, validation, test } = splitDataset(dataset, { train: 0.7, validation: 0.15, test: 0.15 });

    expect(train.length).toBe(70);
    expect(validation.length).toBe(15);
    expect(test.length).toBe(15);
  });

  it('debe soportar proporciones personalizadas (ej. 80/10/10)', () => {
    const { train, validation, test } = splitDataset(dataset, { train: 0.8, validation: 0.1, test: 0.1 });

    expect(train.length).toBe(80);
    expect(validation.length + test.length).toBe(20);
  });

  it('debe lanzar un error si las proporciones no suman 1', () => {
    expect(() => splitDataset(dataset, { train: 0.5, validation: 0.3, test: 0.1 })).toThrow(
      /deben sumar 1/
    );
  });

  it('no debe mutar el arreglo original', () => {
    const original = [...dataset];
    splitDataset(dataset);
    expect(dataset).toEqual(original);
  });
});
