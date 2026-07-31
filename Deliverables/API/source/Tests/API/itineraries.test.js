/**
 * tests/API/itineraries.test.js
 * -----------------------------------------------------------------------
 * Pruebas HTTP con Jest + Supertest sobre src/app.js REAL (no un mock).
 * src/app.js nunca llama a app.listen() ni conecta las bases de datos —
 * por eso se puede importar directo aquí sin levantar un puerto ni
 * requerir MySQL/MongoDB reales.
 *
 * Estas pruebas cubren solo lo que NO depende de una base de datos activa
 * (health check, autenticación JWT, validación de body) para que corran
 * en cualquier máquina/CI sin configuración extra. Las pruebas que sí
 * necesitan datos reales viven en tests/Integration/.
 * -----------------------------------------------------------------------
 */

require('dotenv').config();
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');

const validToken = jwt.sign({ id: 1, email: 'test@travexperience.com', role: 'usuario' }, process.env.JWT_SECRET, {
  expiresIn: '1h',
});

describe('GET /api/v1/health', () => {
  it('debe responder 200 y confirmar que la API está operativa', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/v1/itineraries — protección de ruta', () => {
  it('debe responder 401 sin token de autenticación', async () => {
    const res = await request(app).get('/api/v1/itineraries');
    expect(res.status).toBe(401);
  });

  it('debe responder 401 con un token inválido', async () => {
    const res = await request(app).get('/api/v1/itineraries').set('Authorization', 'Bearer token-invalido');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/itineraries — validación de body', () => {
  it('debe responder 422 si faltan campos obligatorios', async () => {
    const res = await request(app)
      .post('/api/v1/itineraries')
      .set('Authorization', `Bearer ${validToken}`)
      .send({}); // sin title, destination, startDate, endDate

    expect(res.status).toBe(422);
  });

  it('debe responder 422 si startDate no es una fecha ISO8601 válida', async () => {
    const res = await request(app)
      .post('/api/v1/itineraries')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        title: 'Viaje a Oaxaca',
        destination: 'Oaxaca',
        startDate: 'fecha-invalida',
        endDate: '2026-09-12',
      });

    expect(res.status).toBe(422);
  });

  // Nota: un POST con body válido llegaría al controlador y este SÍ
  // requiere MySQL conectado (para guardar el itinerario y correr la
  // predicción de presupuesto). Esa prueba vive en
  // tests/Integration/itinerary_socket_flow.test.js con una BD de prueba.
});
