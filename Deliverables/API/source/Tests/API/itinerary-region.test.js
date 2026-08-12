const { getDefaultItineraryDetails, getRegionMunicipalities } = require('../../src/utils/itineraryRegionHelper');

describe('Itinerarios de la Sierra Norte de Puebla', () => {
  it('debe incluir actividades de Huauchinango, Necaxa y Xicotepec cuando el destino es la región', () => {
    const details = getDefaultItineraryDetails('Sierra Norte de Puebla');

    expect(details.length).toBeGreaterThan(0);
    expect(details.some((item) => /Huauchinango/i.test(item.actividad))).toBe(true);
    expect(details.some((item) => /Necaxa/i.test(item.actividad))).toBe(true);
    expect(details.some((item) => /Xicotepec/i.test(item.actividad))).toBe(true);
  });

  it('debe devolver los municipios objetivo de la región', () => {
    const municipalities = getRegionMunicipalities('Huauchinango');

    expect(municipalities).toEqual(expect.arrayContaining(['Huauchinango', 'Necaxa', 'Xicotepec de Juárez']));
  });
});
