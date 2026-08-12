# TraveXperience — Backend

Backend de la plataforma de turismo **TraveXperience**: planificación de viajes, recomendaciones inteligentes (IA) y sincronización con smartwatches.

## Stack

- **Node.js + Express**
- **MySQL** (Sequelize) → Usuarios, Perfiles, Itinerarios
- **MongoDB** (Mongoose) → Reseñas, logs de actividad, metadatos de IA
- **TensorFlow.js** (`@tensorflow/tfjs-node`, con *fallback* automático a `@tensorflow/tfjs`
  si el binario nativo no compila — ver nota más abajo) → clustering de viajeros y
  predicción de presupuesto
- **JWT** + **bcrypt** → autenticación y cifrado de contraseñas
- **OpenWeatherMap** → clima por coordenadas o destino
- **Stripe** → pagos, tarjetas guardadas y webhooks
- **Google Maps Platform (Geocoding API)** → conversión de dirección de texto a coordenadas

## Estructura del proyecto

```
travexperience-backend/
├── index.js                     # Arranque: conecta BDs, carga IA, levanta el servidor
├── package.json
├── .env.example                 # Variables de entorno (copiar a .env)
├── scripts/
│   └── seedPlaces.js            # Siembra lugares de ejemplo en Xicotepec (piloto)
├── src/
│   ├── app.js                   # Configuración de Express (middlewares + rutas)
│   ├── config/
│   │   ├── mysql.js             # Conexión Sequelize a MySQL
│   │   └── mongodb.js           # Conexión Mongoose a MongoDB
│   ├── models/
│   │   ├── mysql/
│   │   │   ├── User.js          # + refreshTokenHash, passwordResetToken, stripeCustomerId
│   │   │   ├── Itinerary.js
│   │   │   ├── SavedCard.js     # Tarjetas guardadas (Stripe SetupIntent)
│   │   │   └── Transaction.js   # Historial de pagos (Stripe PaymentIntent)
│   │   └── mongodb/
│   │       ├── Place.js         # Catálogo geoespacial (2dsphere) — App/Wearable
│   │       ├── Review.js
│   │       └── ActivityLog.js
│   ├── controllers/
│   │   ├── authController.js         # Módulo 1: registro, login, refresh, reset pass
│   │   ├── localTourismController.js # Módulo 2: "Cerca de Mí" (App Móvil, payload completo)
│   │   ├── itineraryController.js    # Módulo 3: CRUD itinerarios (Web)
│   │   ├── reviewController.js       # Módulo 4: reseñas + recálculo de rating
│   │   ├── wearableController.js     # Módulo 5: endpoints ligeros para Smartwatch
│   │   ├── weatherController.js      # Módulo 6: clima (OpenWeatherMap)
│   │   ├── paymentController.js      # Módulo 7: pagos (Stripe)
│   │   └── mapsController.js         # Módulo 8: geocodificación (Google Maps)
│   ├── routes/
│   │   ├── index.js             # Monta todos los módulos bajo /api/v1
│   │   ├── authRoutes.js
│   │   ├── localTourismRoutes.js
│   │   ├── itineraryRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── wearableRoutes.js
│   │   ├── weatherRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── mapsRoutes.js
│   ├── middlewares/
│   │   ├── authMiddleware.js    # protect() y authorize() con JWT
│   │   ├── validateRequest.js   # Wrapper de express-validator
│   │   └── errorHandler.js      # notFound() + errorHandler() global
│   ├── services/
│   │   ├── aiService.js         # Carga e inferencia de modelos TensorFlow.js
│   │   ├── tokenService.js      # Emisión/verificación de JWT (access + refresh)
│   │   ├── geoService.js        # Consultas $nearSphere compartidas (App + Wearable)
│   │   ├── weatherService.js    # Cliente OpenWeatherMap + caché en memoria (10-15 min)
│   │   ├── stripeService.js     # PaymentIntent, SetupIntent, verificación de webhooks
│   │   └── googleMapsService.js # Geocoding API (dirección de texto -> lat/lng)
│   └── utils/
│       ├── logger.js
│       ├── apiResponse.js       # Formato estándar { success, message, data }
│       └── AppError.js          # Clase de error operacional
└── README.md
```

## Puesta en marcha

```bash
cp .env.example .env      # completar credenciales reales
npm install
npm run seed:places        # (opcional) carga lugares de ejemplo en Xicotepec
npm run dev                # con nodemon
# o
npm start
```

> **Nota sobre TensorFlow en Windows:** `@tensorflow/tfjs-node` usa un binario nativo
> que requiere compilar con `node-gyp` (Visual Studio + "Desktop development with C++").
> Por eso está en `optionalDependencies`: si `npm install` no logra compilarlo, **no
> truena la instalación** — solo lo omite con una advertencia. `aiService.js` detecta
> automáticamente si quedó disponible; si no, cae a `@tensorflow/tfjs` (100% JavaScript,
> sin binarios nativos, un poco más lento pero funciona en cualquier equipo sin setup
> extra). Verás en el log de arranque cuál de los dos quedó activo.

El servidor expone la API bajo el prefijo **`/api/v1`**, por ejemplo:
`GET http://localhost:4000/api/v1/health`

## Endpoints principales

### Módulo 1 — Auth (`/api/v1/auth`) — Web, App y Smartwatch comparten el mismo login
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/register` | Crea cuenta "usuario" o "administrador" |
| POST | `/login` | Devuelve `accessToken` + `refreshToken` |
| POST | `/refresh-token` | Renueva el accessToken sin pedir contraseña |
| POST | `/logout` | Revoca el refreshToken actual |
| GET | `/me` | Perfil del usuario autenticado |
| PUT | `/preferences` | Actualiza preferencias de viaje (input del modelo de clustering) |
| POST | `/forgot-password` / `/reset-password` | Recuperación de contraseña |

### Módulo 2 — Turismo Local (`/api/v1/local`) — App Móvil
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/nearby?lat=&lng=&radius=&category=` | Lugares cercanos, payload completo |
| GET | `/categories` | Categorías disponibles para filtros |
| GET | `/places/:id` | Detalle completo de un lugar |
| POST | `/places` | Solo administradores. Registra un lugar/hotel; si no se envían `lat`/`lng` pero sí `address`, geocodifica automáticamente con Google Maps |

### Módulo 3 — Itinerarios (`/api/v1/itineraries`) — Plataforma Web
CRUD completo (`GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`). Si no se
envía `estimatedBudget`, se intenta estimar automáticamente con el modelo de IA.

### Módulo 4 — Reseñas (`/api/v1/reviews`)
`GET /?placeId=`, `POST /`, `PUT /:id`, `DELETE /:id`. Cada cambio recalcula
`ratingAvg`/`ratingCount` en el `Place` correspondiente (lectura rápida desde el reloj).

### Módulo 5 — Wearable / Smartwatch (`/api/v1/wearable`) — Wear OS (Kotlin)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/itinerary/active` | Itinerario en curso, solo título + destino + actividades de hoy |
| GET | `/nearby?lat=&lng=` | Mini mapa: lugares cercanos con payload mínimo (id, nombre, categoría, lat/lng, distancia, rating) |
| POST | `/location` `{lat, lng}` | Ping de ubicación en tiempo real; responde con alertas instantáneas si hay un lugar muy cercano y bien calificado |
| GET | `/alerts?lat=&lng=` | Igual que `/location` pero sin registrar el evento (refrescar notificación) |

### Módulo 6 — Clima (`/api/v1/weather`) — OpenWeatherMap
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/?lat=&lng=` | Clima por coordenadas: temperatura, sensación térmica, descripción, ícono y probabilidad de lluvia. Respuesta cacheada en memoria 12 min por par de coordenadas (redondeadas a 2 decimales) |
| GET | `/?destination=` | Alternativa a `lat`/`lng`: geocodifica el texto con Google Maps antes de consultar el clima |

Si OpenWeatherMap no responde, el endpoint devuelve `503` con un mensaje claro (no tumba el request).

### Módulo 7 — Pagos (`/api/v1/payments`) — Stripe
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/intent` | Autenticado. Crea un `PaymentIntent` (opcionalmente ligado a un `itineraryId`) y devuelve `clientSecret` al frontend |
| POST | `/setup-intent` | Autenticado. Crea un `SetupIntent` para guardar una tarjeta sin cobrar todavía |
| GET | `/history` | Autenticado. Lista las `Transaction` del usuario |
| GET | `/cards` | Autenticado. Lista las `SavedCard` del usuario (solo `brand`/`last4`/`expiry`, nunca el token completo) |
| POST | `/webhook` | Público (sin JWT). Recibe eventos de Stripe (`payment_intent.succeeded`, `payment_intent.payment_failed`, `setup_intent.succeeded`, etc.) y actualiza `Transaction`/`SavedCard`. Requiere el body crudo — ver `express.raw()` en `app.js` |

Nunca se almacena número de tarjeta ni CVC: solo el `paymentMethodId` que devuelve Stripe.

### Módulo 8 — Google Maps Platform (`/api/v1/maps`) — Geocoding + Places Photos
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/geocode?address=` | Solo administradores. Convierte una dirección de texto en `{ lat, lng, formattedAddress }`, para autocompletado en formularios de admin |
| GET | `/photo?ref=&maxwidth=` | Pública. Proxy de fotos de Google Places: la API key nunca llega al navegador, el backend descarga la imagen y la retransmite |

**Fotos automáticas:** al crear un `Place` (`POST /local/places`) o un `Hotel` (`POST /hotels`)
sin `images`, el backend busca automáticamente una foto real en Google Places
(`googleMapsService.findPlacePhotoReference`) usando nombre + dirección. Si la
encuentra, guarda el `photoReference` y agrega a `images[0]` la URL del proxy
(`/maps/photo?ref=...`) lista para usarse directo en un `<img src>`. Si Google
no tiene el lugar indexado (común en negocios pequeños/locales), el registro
se crea igual, sin foto — no bloquea la operación.

### Módulo 9 — Favoritos (`/api/v1/favorites`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Lugares favoritos del usuario autenticado, con el `Place` ya incluido (populate) |
| POST | `/` `{placeId}` | Agrega un lugar a favoritos (idempotente: si ya existe, no duplica) |
| DELETE | `/:placeId` | Quita un lugar de favoritos |

### Módulo 10 — Hoteles (`/api/v1/hotels`) — Admin/registroHotel.jsx, Admin/inventario.jsx
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/?municipality=&mine=` | Listado público, paginado. `?mine=true` (autenticado) filtra solo los del admin dueño |
| GET | `/nearby?lat=&lng=&radius=` | Búsqueda geoespacial (índice 2dsphere), igual patrón que `/local/nearby` |
| GET | `/:id` | Detalle completo, incluye `rooms[]` y `amenities[]` |
| POST | `/` | Solo administradores. Si no se envían `lat`/`lng` pero sí `address`, geocodifica automáticamente con Google Maps |
| PUT | `/:id` | Solo el administrador dueño del hotel |
| DELETE | `/:id` | Solo el administrador dueño del hotel |

### Módulo 11 — Transporte (`/api/v1/transport-routes`) — Admin/registroTransporte.jsx
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/?origin=&destination=&day=&mine=` | Búsqueda pública por origen/destino/día de la semana (`L,M,X,J,V,S,D`) |
| GET | `/:id` | Detalle de la ruta, incluye `fareClasses[]` (clases de tarifa) |
| POST | `/` | Solo administradores. Acepta `fareClasses` anidado en el mismo body |
| PUT | `/:id` | Solo el administrador dueño. Si se envía `fareClasses`, reemplaza las existentes |
| DELETE | `/:id` | Solo el administrador dueño (borra en cascada sus `fareClasses`) |

## Arquitectura de datos geoespaciales

`Place` y `Hotel` (MongoDB) usan un índice `2dsphere` cada uno. `services/geoService.js`
centraliza la consulta `$nearSphere` sobre `Place` y es reutilizada por:
- **App Móvil** (`localTourismController`) → payload completo (fotos, tags, descripción).
- **Smartwatch** (`wearableController`) → payload reducido (`toWatchPayload`), radio de
  búsqueda más corto (1.5 km) y un radio de "alerta instantánea" de 300 m para lugares
  con `ratingAvg >= 4`, replicando el comportamiento descrito en el Canvas: *"Notifica
  lugares cercanos al instante, sin necesidad de sacar el celular."*

`hotelController.getNearbyHotels` implementa la misma consulta `$nearSphere` directamente
(sin pasar por `geoService.js`, que está acoplado al modelo `Place`) para mantener el
acoplamiento bajo entre ambos catálogos.

## Estado actual — Backend completo (Fase 3 — entregado)

- ✅ Controladores completos para los 11 módulos, con lógica de negocio real.
- ✅ Autenticación JWT de doble token (access + refresh) con revocación vía hash en BD.
- ✅ Validaciones de `express-validator` en todas las rutas de escritura.
- ✅ Motor geoespacial compartido (`geoService.js`) para App Móvil y Smartwatch; `Hotel`
  con su propia búsqueda geoespacial análoga.
- ✅ Endpoints ligeros y de baja latencia específicos para Wear OS (Kotlin).
- ✅ Recalculo automático de calificaciones (`Place.ratingAvg`) al crear/editar/borrar reseñas.
- ✅ Script de siembra de datos (`scripts/seedPlaces.js`) para pruebas inmediatas.
- ✅ Integraciones externas: Clima (OpenWeatherMap, con caché en memoria), Pagos (Stripe:
  PaymentIntent, SetupIntent, webhooks) y Geocoding (Google Maps Platform).
- ✅ Favoritos, Hoteles (con habitaciones/amenidades) y Transporte (con clases de tarifa).


