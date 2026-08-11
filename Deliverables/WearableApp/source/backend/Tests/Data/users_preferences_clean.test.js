/**
 * tests/Data/users_preferences_clean.test.js
 * -----------------------------------------------------------------------
 * Valida Data/Processed/users_preferences_clean.csv. Igual que en
 * itineraries_clean.test.js, se usa un fixture de ejemplo mientras el
 * ETL real no esté conectado a MySQL.
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

// Reemplazar por: fs.readFileSync('Data/Processed/users_preferences_clean.csv', 'utf-8')
const SAMPLE_CSV = `user_id,edad,presupuestoPromedio,interesAventura,interesCultura,prefiereViajarSolo
1,28,0.35,1,0,0
2,45,0.62,0,1,1
3,19,0.15,1,1,0`;

describe('Data/Processed/users_preferences_clean.csv — validación de calidad', () => {
  const rows = parseCsv(SAMPLE_CSV);

  it('edad debe estar en un rango razonable (13-99)', () => {
    rows.forEach((row) => {
      const edad = Number(row.edad);
      expect(edad).toBeGreaterThanOrEqual(13);
      expect(edad).toBeLessThanOrEqual(99);
    });
  });

  it('presupuestoPromedio normalizado debe estar entre 0 y 1', () => {
    rows.forEach((row) => {
      const val = Number(row.presupuestoPromedio);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(1);
    });
  });

  it('los campos booleanos deben ser estrictamente 0 o 1', () => {
    const boolFields = ['interesAventura', 'interesCultura', 'prefiereViajarSolo'];
    rows.forEach((row) => {
      boolFields.forEach((field) => {
        expect(['0', '1']).toContain(row[field]);
      });
    });
  });

  it('no debe haber user_id duplicados', () => {
    const ids = rows.map((r) => r.user_id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
