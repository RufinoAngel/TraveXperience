/**
 * tests/Utils/normalizationStore.test.js
 * -----------------------------------------------------------------------
 * Prueba directa del bug original: scripts/trainBudgetModel.js calculaba
 * xMax pero nunca lo guardaba, así que la normalización usada en
 * entrenamiento no se podía reproducir en inferencia. normalizationStore.js
 * es lo que corrige eso — se prueba el ciclo completo save -> load y el
 * caso "todavía no existe" que predictBudget() usa para rechazar
 * predicciones inseguras (ver aiService.js).
 * -----------------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { saveNormalization, loadNormalization } = require('../../src/utils/normalizationStore');

describe('normalizationStore', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'normalization-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('loadNormalization debe devolver null si normalization.json todavía no existe', () => {
    expect(loadNormalization(tmpDir)).toBeNull();
  });

  it('saveNormalization debe crear normalization.json junto al modelo', () => {
    const filePath = saveNormalization(tmpDir, { maxDurationDays: 14, maxNumActivities: 10 });
    expect(fs.existsSync(filePath)).toBe(true);
    expect(path.basename(filePath)).toBe('normalization.json');
  });

  it('lo que se guarda con saveNormalization debe leerse igual con loadNormalization (round-trip)', () => {
    saveNormalization(tmpDir, { maxDurationDays: 21, maxNumActivities: 8 });
    const loaded = loadNormalization(tmpDir);

    expect(loaded.maxDurationDays).toBe(21);
    expect(loaded.maxNumActivities).toBe(8);
  });

  it('debe agregar un timestamp savedAt automáticamente', () => {
    saveNormalization(tmpDir, { maxDurationDays: 5, maxNumActivities: 3 });
    const loaded = loadNormalization(tmpDir);

    expect(loaded.savedAt).toBeDefined();
    expect(Number.isNaN(new Date(loaded.savedAt).getTime())).toBe(false);
  });

  it('debe crear el directorio destino si no existe todavía (mkdirSync recursive)', () => {
    const nestedDir = path.join(tmpDir, 'budget-prediction-model');
    expect(fs.existsSync(nestedDir)).toBe(false);

    saveNormalization(nestedDir, { maxDurationDays: 7, maxNumActivities: 4 });

    expect(fs.existsSync(path.join(nestedDir, 'normalization.json'))).toBe(true);
  });

  it('una escritura posterior debe sobrescribir la normalización anterior (reentrenamientos)', () => {
    saveNormalization(tmpDir, { maxDurationDays: 10, maxNumActivities: 5 });
    saveNormalization(tmpDir, { maxDurationDays: 30, maxNumActivities: 15 });

    const loaded = loadNormalization(tmpDir);
    expect(loaded.maxDurationDays).toBe(30);
    expect(loaded.maxNumActivities).toBe(15);
  });
});
