/**
 * tests/Models/travelerClusters.test.js
 * -----------------------------------------------------------------------
 * Prueba el mapeo cluster -> nombre corregido en
 * src/config/travelerClusters.js (ver scripts/analyzeClusteringModel.js
 * para la metodología con la que se validó contra el modelo real).
 * -----------------------------------------------------------------------
 */

const { CLUSTER_LABELS, getClusterLabel } = require('../../src/config/travelerClusters');

describe('src/config/travelerClusters', () => {
  it('debe tener exactamente 4 etiquetas (N_CLUSTERS del modelo entrenado)', () => {
    expect(CLUSTER_LABELS).toHaveLength(4);
  });

  it('el índice 1 debe ser "Aventurero" (confirmado: adventureInterest=1 siempre gana ese cluster)', () => {
    expect(getClusterLabel(1)).toBe('Aventurero');
  });

  it('ya no debe existir la etiqueta "Familiar" (no es un cluster real, ver comentarios del archivo)', () => {
    expect(CLUSTER_LABELS).not.toContain('Familiar');
  });

  it('debe devolver "Desconocido" para un índice fuera de rango', () => {
    expect(getClusterLabel(99)).toBe('Desconocido');
    expect(getClusterLabel(-1)).toBe('Desconocido');
  });
});
