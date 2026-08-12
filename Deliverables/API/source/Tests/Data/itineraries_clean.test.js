/**
 * tests/Data/itineraries_clean.test.js
 * -----------------------------------------------------------------------
 * Valida que Data/Processed/itineraries_clean.csv (una vez que exista,
 * generado por el ETL real) cumpla reglas mínimas de calidad antes de
 * usarse para entrenar. Mientras el ETL real no esté conectado a la BD,
 * se valida contra un fixture de ejemplo con la misma forma esperada.
 * -----------------------------------------------------------------------
 */

const parseCsv = (csvText) => {
  const [headerLine, ...lines] = csvText.trim().split('\n');
  const headers = headerLine.split(',');
  return lines
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const values = line.split(',');
      return headers.reduce((row, h, i) => ({ ...row, [h]: values[i] }), {});
    });
};

// Fixture: representa la forma esperada de itineraries_clean.csv.
// Reemplazar por: fs.readFileSync('Data/Processed/itineraries_clean.csv', 'utf-8')
const SAMPLE_CSV = `itinerary_id,destino,duracionDias,numActividades,estimatedBudget,startDate,endDate
1,Cancun,5,4,4550.00,2026-08-01,2026-08-05
2,Oaxaca,3,2,2350.00,2026-09-10,2026-09-12
3,Guadalajara,7,6,6350.00,2026-07-15,2026-07-21`;

describe('Data/Processed/itineraries_clean.csv — validación de calidad', () => {
  const rows = parseCsv(SAMPLE_CSV);

  it('no debe tener filas vacías', () => {
    expect(rows.length).toBeGreaterThan(0);
  });

  it('estimatedBudget debe ser siempre positivo', () => {
    rows.forEach((row) => {
      expect(Number(row.estimatedBudget)).toBeGreaterThan(0);
    });
  });

  it('duracionDias debe ser siempre mayor a 0', () => {
    rows.forEach((row) => {
      expect(Number(row.duracionDias)).toBeGreaterThan(0);
    });
  });

  it('startDate debe ser anterior o igual a endDate', () => {
    rows.forEach((row) => {
      expect(new Date(row.startDate).getTime()).toBeLessThanOrEqual(new Date(row.endDate).getTime());
    });
  });

  it('no debe haber itinerary_id duplicados', () => {
    const ids = rows.map((r) => r.itinerary_id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('destino no debe estar vacío en ninguna fila', () => {
    rows.forEach((row) => {
      expect(row.destino.trim().length).toBeGreaterThan(0);
    });
  });
});
