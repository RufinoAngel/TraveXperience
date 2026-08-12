/**
 * tests/Integration/itinerary_creation_flow.test.js
 * -----------------------------------------------------------------------
 * Prueba el flujo completo de creación de un itinerario:
 *   POST /itineraries → aiService.predictBudget() → Itinerary.create()
 *
 * Se mockean la capa de datos (Sequelize) y aiService para poder
 * ejecutar el flujo de punta a punta SIN necesitar MySQL real ni un
 * modelo de TensorFlow cargado — así corre en cualquier máquina/CI.
 * Para una prueba contra la base de datos real, usar una BD de prueba
 * dedicada (ver nota al final de este archivo).
 * -----------------------------------------------------------------------
 */

require('dotenv').config();
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/services/aiService');
jest.mock('../../src/sockets', () => ({
  getIO: jest.fn(() => ({
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  })),
}));

const Itinerary = require('../../src/models/mysql/Itinerary');
const aiService = require('../../src/services/aiService');
const app = require('../../src/app');

const validToken = jwt.sign({ id: 1, email: 'test@travexperience.com', role: 'usuario' }, process.env.JWT_SECRET, {
  expiresIn: '1h',
});

describe('Flujo de integración: creación de itinerario con predicción de presupuesto', () => {
  let createSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    createSpy = jest.spyOn(Itinerary, 'create');
  });

  afterEach(() => {
    createSpy.mockRestore();
  });

  it('debe usar aiService.predictBudget() cuando no se envía estimatedBudget', async () => {
    aiService.isReady.mockReturnValue(true);
    aiService.predictBudget.mockResolvedValue(4550.75);

    createSpy.mockResolvedValue({
      id: 101,
      userId: 1,
      title: 'Viaje a Cancún',
      destination: 'Cancún',
      startDate: '2026-08-01',
      endDate: '2026-08-05',
      itineraryDetails: [{ actividad: 'Snorkel' }, { actividad: 'Museo' }],
      estimatedBudget: 4550.75,
      status: 'borrador',
    });

    const res = await request(app)
      .post('/api/v1/itineraries')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        title: 'Viaje a Cancún',
        destination: 'Cancún',
        startDate: '2026-08-01',
        endDate: '2026-08-05',
        itineraryDetails: [{ actividad: 'Snorkel' }, { actividad: 'Museo' }],
      });

    expect(res.status).toBe(201);
    expect(aiService.predictBudget).toHaveBeenCalledWith([5, 2]); // 5 días, 2 actividades
    expect(res.body.data.itinerary.estimatedBudget).toBe(4550.75);
  });

  it('debe respetar un estimatedBudget explícito y NO llamar al modelo de IA', async () => {
    createSpy.mockResolvedValue({
      id: 102,
      userId: 1,
      title: 'Viaje a Oaxaca',
      destination: 'Oaxaca',
      startDate: '2026-09-10',
      endDate: '2026-09-12',
      itineraryDetails: [],
      estimatedBudget: 3000,
      status: 'borrador',
    });

    const res = await request(app)
      .post('/api/v1/itineraries')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        title: 'Viaje a Oaxaca',
        destination: 'Oaxaca',
        startDate: '2026-09-10',
        endDate: '2026-09-12',
        estimatedBudget: 3000,
      });

    expect(res.status).toBe(201);
    expect(aiService.predictBudget).not.toHaveBeenCalled();
    expect(res.body.data.itinerary.estimatedBudget).toBe(3000);
  });

  it('debe responder 422 si endDate es anterior a startDate', async () => {
    const res = await request(app)
      .post('/api/v1/itineraries')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        title: 'Viaje inválido',
        destination: 'CDMX',
        startDate: '2026-09-15',
        endDate: '2026-09-10',
      });

    expect(res.status).toBe(422);
    expect(createSpy).not.toHaveBeenCalled();
  });
});

/**
 * NOTA para la prueba contra base de datos real (no mockeada):
 *
 * Crear un archivo .env.test con una base de datos MySQL de prueba
 * (puede ser SQLite en memoria configurando Sequelize con dialect:
 * 'sqlite', storage: ':memory:' solo para tests), correr las
 * migraciones/sync, y en un test aparte (ej.
 * itinerary_creation_flow.real_db.test.js) NO mockear
 * src/models/mysql/Itinerary ni src/services/aiService, sino conectar
 * de verdad y limpiar la tabla en un afterEach(). Eso valida además que
 * el modelo Sequelize y las restricciones de la BD (NOT NULL, tipos)
 * sean consistentes con lo que espera el controlador.
 */
