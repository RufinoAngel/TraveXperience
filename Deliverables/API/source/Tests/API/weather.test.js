/**
 * tests/API/weather.test.js
 * -----------------------------------------------------------------------
 * GET /api/v1/weather es una ruta pública (sin JWT). Se valida solo el
 * comportamiento de validación de query params, que no requiere llamar
 * a la API externa de OpenWeatherMap ni tocar la base de datos.
 * -----------------------------------------------------------------------
 */

require('dotenv').config();
const request = require('supertest');
const app = require('../../src/app');

describe('GET /api/v1/weather — validación de query params', () => {
  it('debe responder 422 si lat está fuera de rango', async () => {
    const res = await request(app).get('/api/v1/weather').query({ lat: 999, lng: -99 });
    expect(res.status).toBe(422);
  });

  it('debe responder 422 si destination es demasiado corto', async () => {
    const res = await request(app).get('/api/v1/weather').query({ destination: 'x' });
    expect(res.status).toBe(422);
  });

  // Nota: un request con parámetros válidos llegaría a weatherController,
  // que sí llama a la API externa de OpenWeatherMap — esa prueba (con la
  // API real o un mock de axios) vive en tests/Integration/.
});
