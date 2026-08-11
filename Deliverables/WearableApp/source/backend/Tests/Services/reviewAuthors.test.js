/**
 * tests/Services/reviewAuthors.test.js
 * -----------------------------------------------------------------------
 * Prueba el join manual Mongo (Review) <-> MySQL (User) agregado en
 * reviewController.js#attachReviewAuthors, que resuelve el pendiente
 * "authorName/authorPhoto en GET /reviews" del reporte de entrega.
 * Se mockea User.findAll (Sequelize) para no requerir MySQL real.
 * -----------------------------------------------------------------------
 */

const { Op } = require('sequelize');
const { attachReviewAuthors } = require('../../src/controllers/reviewController');
const User = require('../../src/models/mysql/User');

describe('attachReviewAuthors', () => {
  let findAllSpy;

  beforeEach(() => {
    findAllSpy = jest.spyOn(User, 'findAll');
  });

  afterEach(() => {
    findAllSpy.mockRestore();
  });

  it('con un arreglo vacío no debe llamar a la base de datos', async () => {
    const result = await attachReviewAuthors([]);
    expect(result).toEqual([]);
    expect(findAllSpy).not.toHaveBeenCalled();
  });

  it('debe agregar authorName y authorPhoto (usando avatar) a cada reseña', async () => {
    findAllSpy.mockResolvedValue([{ id: 7, fullName: 'Ana López', avatar: '/uploads/profiles/ana.png', profilePhoto: null }]);

    const reviews = [{ userId: 7, comment: 'Muy buen lugar' }];
    const result = await attachReviewAuthors(reviews);

    expect(result[0].authorName).toBe('Ana López');
    expect(result[0].authorPhoto).toBe('/uploads/profiles/ana.png');
  });

  it('si no hay avatar, debe usar profilePhoto como fallback', async () => {
    findAllSpy.mockResolvedValue([{ id: 7, fullName: 'Ana López', avatar: null, profilePhoto: '/uploads/profiles/old.png' }]);

    const result = await attachReviewAuthors([{ userId: 7 }]);

    expect(result[0].authorPhoto).toBe('/uploads/profiles/old.png');
  });

  it('si el usuario ya no existe en MySQL (cuenta eliminada), debe usar el placeholder en vez de fallar', async () => {
    findAllSpy.mockResolvedValue([]); // el userId de la reseña no aparece en la respuesta

    const result = await attachReviewAuthors([{ userId: 999 }]);

    expect(result[0].authorName).toBe('Usuario eliminado');
    expect(result[0].authorPhoto).toBeNull();
  });

  it('debe hacer UNA sola consulta a MySQL para varias reseñas del mismo usuario (evita N+1)', async () => {
    findAllSpy.mockResolvedValue([{ id: 7, fullName: 'Ana López', avatar: null, profilePhoto: null }]);

    await attachReviewAuthors([{ userId: 7 }, { userId: 7 }, { userId: 7 }]);

    expect(findAllSpy).toHaveBeenCalledTimes(1);
    expect(findAllSpy.mock.calls[0][0].where.id[Op.in]).toEqual([7]);
  });

  it('debe resolver correctamente varias reseñas de distintos autores', async () => {
    findAllSpy.mockResolvedValue([
      { id: 1, fullName: 'Ana López', avatar: null, profilePhoto: null },
      { id: 2, fullName: 'Beto Ruiz', avatar: '/uploads/profiles/beto.png', profilePhoto: null },
    ]);

    const result = await attachReviewAuthors([{ userId: 1 }, { userId: 2 }]);

    expect(result[0].authorName).toBe('Ana López');
    expect(result[1].authorName).toBe('Beto Ruiz');
    expect(result[1].authorPhoto).toBe('/uploads/profiles/beto.png');
  });
});
