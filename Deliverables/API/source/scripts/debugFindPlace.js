require('dotenv').config();
const fetch = globalThis.fetch || require('node-fetch');

const FIND_PLACE_BASE_URL = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json';

const run = async () => {
  const query = process.argv.slice(2).join(' ') || 'Cascada de Patla, Xicotepec, Puebla';
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_MAPS_API_KEY no está configurada en .env');
    process.exit(1);
  }

  const url = new URL(FIND_PLACE_BASE_URL);
  url.searchParams.set('input', query);
  url.searchParams.set('inputtype', 'textquery');
  url.searchParams.set('fields', 'place_id,photos');
  url.searchParams.set('key', apiKey);

  console.log('Request URL:', url.toString());

  try {
    const res = await fetch(url);
    console.log('HTTP', res.status, res.statusText);
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      console.log('JSON response:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Raw response text:', text);
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
    process.exit(1);
  }
};

run();
