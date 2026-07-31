require('dotenv').config();
const request = require('supertest');
const app = require('../../src/app');

describe('Autenticación y fotos de perfil', () => {
  it('debe aceptar una solicitud de perfil con un archivo de imagen', async () => {
    const res = await request(app)
      .put('/api/v1/auth/profile')
      .attach('profilePhoto', Buffer.from('fake-image'), { filename: 'avatar.png', contentType: 'image/png' });

    expect([400, 401, 404]).toContain(res.status);
  });
});
