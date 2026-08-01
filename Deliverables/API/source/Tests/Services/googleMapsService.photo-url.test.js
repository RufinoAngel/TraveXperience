const googleMapsService = require('../../src/services/googleMapsService');

describe('googleMapsService.buildPhotoProxyUrl', () => {
  it('debe devolver la URL estática local desde la raíz del backend, no desde /api/v1', () => {
    const photoUrl = googleMapsService.buildPhotoProxyUrl(
      'http://192.168.90.11:4000/api/v1',
      '/uploads/profiles/avatar-123.jpeg'
    );

    expect(photoUrl).toBe('http://192.168.90.11:4000/uploads/profiles/avatar-123.jpeg');
  });

  it('debe dejar intacta una URL completa de terceros', () => {
    const absoluteUrl = 'https://cdn.example.com/images/photo.jpg';
    const photoUrl = googleMapsService.buildPhotoProxyUrl('http://192.168.90.11:4000/api/v1', absoluteUrl);

    expect(photoUrl).toBe(absoluteUrl);
  });

  it('debe generar el proxy de Google Places cuando recibe una referencia de Places', () => {
    const photoUrl = googleMapsService.buildPhotoProxyUrl(
      'http://192.168.90.11:4000',
      'photo-reference-abc'
    );

    expect(photoUrl).toBe('http://192.168.90.11:4000/api/v1/maps/photo?ref=photo-reference-abc');
  });
});
