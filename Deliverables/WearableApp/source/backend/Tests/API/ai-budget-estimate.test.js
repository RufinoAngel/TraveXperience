/**
 * tests/API/ai-budget-estimate.test.js
 * -----------------------------------------------------------------------
 * GET /api/v1/ai/budget-estimate. aiService se mockea (mismo patrón que
 * tests/Integration/itinerary_creation_flow.test.js) para no requerir un
 * modelo de TensorFlow cargado ni su normalization.json real.
 * -----------------------------------------------------------------------
 */

require('dotenv').config();
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/services/aiService');

const aiService = require('../../src/services/aiService');
const app = require('../../src/app');

const validToken = jwt.sign({ id: 1, email: 'test@travexperience.com', role: 'usuario' }, process.env.JWT_SECRET, {
  expiresIn: '1h',
});

const call = (query) =>
  request(app).get('/api/v1/ai/budget-estimate').query(query).set('Authorization', `Bearer ${validToken}`);

describe('GET /api/v1/ai/budget-estimate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe responder 401 sin token de autenticación', async () => {
    const res = await request(app)
      .get('/api/v1/ai/budget-estimate')
      .query({ startDate: '2026-08-01', endDate: '2026-08-05' });
    expect(res.status).toBe(401);
  });

  it('debe responder 422 si falta startDate o endDate (validado por express-validator antes del controller)', async () => {
    const res = await call({ endDate: '2026-08-05' });
    expect(res.status).toBe(422);
    expect(aiService.predictBudget).not.toHaveBeenCalled();
  });

  it('debe responder 422 si numActivities es negativo (validado por express-validator)', async () => {
    const res = await call({ startDate: '2026-08-01', endDate: '2026-08-05', numActivities: -1 });
    expect(res.status).toBe(422);
  });

  it('debe responder 503 si el servicio de IA no está listo (isReady() false)', async () => {
    aiService.isReady.mockReturnValue(false);

    const res = await call({ startDate: '2026-08-01', endDate: '2026-08-05' });

    expect(res.status).toBe(503);
  });

  it('debe responder 422 si endDate es anterior a startDate', async () => {
    aiService.isReady.mockReturnValue(true);

    const res = await call({ startDate: '2026-08-05', endDate: '2026-08-01' });

    expect(res.status).toBe(422);
    expect(aiService.predictBudget).not.toHaveBeenCalled();
  });

  it('200: debe calcular durationDays correctamente (inclusivo) y pasar [duración, numActivities] a predictBudget', async () => {
    aiService.isReady.mockReturnValue(true);
    aiService.predictBudget.mockResolvedValue(5230.1);

    // 2026-08-01 a 2026-08-05 -> 5 días (inclusivo, igual que itineraryController.js)
    const res = await call({ startDate: '2026-08-01', endDate: '2026-08-05', numActivities: 3 });

    expect(res.status).toBe(200);
    expect(aiService.predictBudget).toHaveBeenCalledWith([5, 3]);
    expect(res.body.data).toEqual({
      estimatedBudget: 5230.1,
      durationDays: 5,
      numActivities: 3,
    });
  });

  it('debe usar numActivities=0 por defecto si no se envía', async () => {
    aiService.isReady.mockReturnValue(true);
    aiService.predictBudget.mockResolvedValue(1000);

    const res = await call({ startDate: '2026-08-01', endDate: '2026-08-01' });

    expect(res.status).toBe(200);
    expect(aiService.predictBudget).toHaveBeenCalledWith([1, 0]); // mismo día -> 1 día, 0 actividades
    expect(res.body.data.numActivities).toBe(0);
  });

  it('debe responder 500 si aiService.predictBudget lanza un error de TensorFlow', async () => {
    aiService.isReady.mockReturnValue(true);
    aiService.predictBudget.mockRejectedValue(new Error('modelo no cargado'));

    const res = await call({ startDate: '2026-08-01', endDate: '2026-08-05' });

    expect(res.status).toBe(500);
  });
});
