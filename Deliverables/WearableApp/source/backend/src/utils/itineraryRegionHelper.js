const REGION_KEYWORDS = {
  'sierra norte de puebla': {
    label: 'Sierra Norte de Puebla',
    municipalities: ['Huauchinango', 'Necaxa', 'Xicotepec de Juárez'],
    defaultActivities: [
      { dia: 1, actividad: 'Cascada de Necaxa' },
      { dia: 2, actividad: 'Parque Nacional Cañón de Metztitlán' },
      { dia: 2, actividad: 'Centro de Huauchinango y miradores' },
      { dia: 3, actividad: 'Xicotepec de Juárez y sus plazas tradicionales' },
      { dia: 3, actividad: 'Ruta de pueblos y gastronomía de la Sierra Norte' },
    ],
  },
};

const normalizeRegion = (value = '') => String(value).trim().toLowerCase();

const isRegionDestination = (destination = '') => {
  const normalized = normalizeRegion(destination);
  if (normalized.includes('sierra norte de puebla') || normalized.includes('sierra norte')) {
    return true;
  }

  return ['huauchinango', 'necaxa', 'xicotepec', 'xicotepec de juarez', 'xicotepec de juárez'].some((term) =>
    normalized.includes(term)
  );
};

const getRegionMunicipalities = (destination = '') => {
  if (!isRegionDestination(destination)) {
    return [];
  }

  return REGION_KEYWORDS['sierra norte de puebla'].municipalities;
};

const getDefaultItineraryDetails = (destination = '') => {
  if (!isRegionDestination(destination)) {
    return [];
  }

  const region = REGION_KEYWORDS['sierra norte de puebla'];

  if (!region) {
    return [];
  }

  return region.defaultActivities.map((item) => ({ ...item }));
};

module.exports = {
  REGION_KEYWORDS,
  getRegionMunicipalities,
  getDefaultItineraryDetails,
};
