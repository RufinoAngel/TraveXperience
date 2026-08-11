/**
 * tests/API/ai-traveler-type.test.js
 * -----------------------------------------------------------------------
 * GET /api/v1/ai/traveler-type. Se mockean aiService (para no requerir un
 * modelo de TensorFlow cargado) y los modelos de Sequelize (User,
 * Itinerary) para no requerir MySQL real — mismo patrón que
 * tests/Integration/itinerary_creation_flow.test.js.
 * -----------------------------------------------------------------------
 */

require('dotenv').config();
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/services/aiService');

const aiService = require('../../src/services/aiService');
const User = require('../../src/models/mysql/User');
const Itinerary = require('../../src/models/mysql/Itinerary');
const app = require('../../src/app');

const validToken = jwt.sign({ id: 1, email: 'test@travexperience.com', role: 'usuario' }, process.env.JWT_SECRET, {
  expiresIn: '1h',
});

const call = () => request(app).get('/api/v1/ai/traveler-type').set('Authorization', `Bearer ${validToken}`);

describe('GET /api/v1/ai/traveler-type', () => {
  let findByPkSpy;
  let itinerariesFindAllSpy;
  let userFindAllSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    findByPkSpy = jest.spyOn(User, 'findByPk');
    itinerariesFindAllSpy = jest.spyOn(Itinerary, 'findAll').mockResolvedValue([]);
    // computeClusteringBounds() en aiController.js llama User.findAll para
    // calcular maxAge/maxBudget sobre la base actual.
    userFindAllSpy = jest.spyOn(User, 'findAll').mockResolvedValue([
      { travelPreferences: { age: 40, avgBudget: 9000 } },
      { travelPreferences: { age: 25, avgBudget: 5000 } },
    ]);
  });

  afterEach(() => {
    findByPkSpy.mockRestore();
    itinerariesFindAllSpy.mockRestore();
    userFindAllSpy.mockRestore();
  });

  it('debe responder 401 sin token de autenticación', async () => {
    const res = await request(app).get('/api/v1/ai/traveler-type');
    expect(res.status).toBe(401);
  });

  it('debe responder 503 si el modelo de clustering no está listo', async () => {
    aiService.isClusteringReady.mockReturnValue(false);

    const res = await call();

    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
  });

  it('debe responder 404 si el usuario del token no existe', async () => {
    aiService.isClusteringReady.mockReturnValue(true);
    findByPkSpy.mockResolvedValue(null);

    const res = await call();

    expect(res.status).toBe(404);
  });

  it('debe responder 422 con missingFields cuando faltan preferencias de viaje', async () => {
    aiService.isClusteringReady.mockReturnValue(true);
    findByPkSpy.mockResolvedValue({
      id: 1,
      travelPreferences: {}, // sin age/interesAventura/interesCultura/viajaSolo
    });

    const res = await call();

    expect(res.status).toBe(422);
    expect(res.body.errors.missingFields).toEqual(
      expect.arrayContaining(['age', 'interesAventura', 'interesCultura', 'viajaSolo', 'avgBudget'])
    );
  });

  it('debe responder 422 si solo falta avgBudget (sin preferencia guardada ni itinerarios con presupuesto)', async () => {
    aiService.isClusteringReady.mockReturnValue(true);
    findByPkSpy.mockResolvedValue({
      id: 1,
      travelPreferences: { age: 30, interesAventura: true, interesCultura: false, viajaSolo: true },
    });
    itinerariesFindAllSpy.mockResolvedValue([]); // sin itinerarios con estimatedBudget

    const res = await call();

    expect(res.status).toBe(422);
    expect(res.body.errors.missingFields).toEqual(['avgBudget']);
  });

  it('debe calcular avgBudget como promedio de itinerarios propios si no hay travelPreferences.avgBudget', async () => {
    aiService.isClusteringReady.mockReturnValue(true);
    findByPkSpy.mockResolvedValue({
      id: 1,
      travelPreferences: { age: 30, interesAventura: true, interesCultura: false, viajaSolo: true },
    });
    itinerariesFindAllSpy.mockResolvedValue([{ estimatedBudget: 4000 }, { estimatedBudget: 6000 }]);
    aiService.predictTravelerCluster.mockResolvedValue([0.1, 0.7, 0.1, 0.1]);

    const res = await call();

    expect(res.status).toBe(200);
    expect(res.body.data.featuresUsed.avgBudget).toBe(5000); // (4000+6000)/2
    expect(res.body.data.featuresUsed.avgBudgetSource).toBe('promedio de itinerarios propios');
  });

  it('200: debe devolver cluster/travelerType/probabilities coherentes con la predicción mockeada', async () => {
    aiService.isClusteringReady.mockReturnValue(true);
    findByPkSpy.mockResolvedValue({
      id: 1,
      travelPreferences: {
        age: 28,
        avgBudget: 7000,
        interesAventura: true,
        interesCultura: false,
        viajaSolo: true,
      },
    });
    // índice 1 domina -> según src/config/travelerClusters.js validado
    // empíricamente contra el modelo real, el índice 1 es "Aventurero".
    aiService.predictTravelerCluster.mockResolvedValue([0.05, 0.8, 0.1, 0.05]);

    const res = await call();

    expect(res.status).toBe(200);
    expect(res.body.data.cluster).toBe(1);
    expect(res.body.data.travelerType).toBe('Aventurero');
    expect(res.body.data.probabilities).toEqual([0.05, 0.8, 0.1, 0.05]);
    expect(res.body.data.featuresUsed).toMatchObject({
      age: 28,
      avgBudget: 7000,
      adventureInterest: true,
      cultureInterest: false,
      soloTravelPreference: true,
    });
  });

  it('debe responder 500 si aiService.predictTravelerCluster lanza un error de TensorFlow', async () => {
    aiService.isClusteringReady.mockReturnValue(true);
    findByPkSpy.mockResolvedValue({
      id: 1,
      travelPreferences: {
        age: 28,
        avgBudget: 7000,
        interesAventura: true,
        interesCultura: false,
        viajaSolo: true,
      },
    });
    aiService.predictTravelerCluster.mockRejectedValue(new Error('tensor shape mismatch'));

    const res = await call();

    expect(res.status).toBe(500);
  });
});
