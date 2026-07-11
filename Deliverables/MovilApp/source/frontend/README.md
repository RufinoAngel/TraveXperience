# TraveXperience — React Native (Expo)

Réplica en React Native de las pantallas de TraveXperience, con **Header** y **BottomNav**
extraídos como componentes reutilizables e independientes, y navegación real con
**React Navigation** (stack anidado dentro de bottom tabs).

## Estructura

```
App.js
src/
  theme/index.js            # colores, tipografía, spacing, radios (design tokens)
  components/
    Header.js                # header reutilizable: variant="main" | "sub", tone="navy"|"amber"|"light"
    BottomNav.js              # barra de navegación inferior (tab bar personalizada)
    UI.js                     # Card, Badge, SearchBar, PrimaryButton, etc.
  data/mock.js                # datos de ejemplo usados en todas las pantallas
  navigation/
    RootNavigator.js          # Stack raíz: Login -> Main (tabs)
    MainTabNavigator.js        # Bottom tabs usando <BottomNav />
    DiscoverStack.js / ItineraryStack.js / WalletStack.js / ProfileStack.js
  screens/                    # 16 pantallas (una por cada mockup)
```

## Pantallas incluidas

| Pantalla | Archivo |
|---|---|
| Login / Splash | `LoginScreen.js` |
| Descubrir (home) | `DiscoverHomeScreen.js` |
| Descubrir (búsqueda/categorías) | `DiscoverSearchScreen.js` |
| Descubrir (mapa) | `DiscoverMapScreen.js` |
| Itinerario (cronograma) | `ItineraryScreen.js` |
| Gestión de Transporte | `TransportManagementScreen.js` |
| Pago Exitoso | `PaymentSuccessScreen.js` |
| Cartera (métodos de pago) | `WalletScreen.js` |
| Historial de Pagos | `PaymentHistoryScreen.js` |
| Historial de Vuelos | `FlightHistoryScreen.js` |
| Historial de Hoteles | `HotelHistoryScreen.js` |
| Historial de Transporte | `TransportHistoryScreen.js` |
| Perfil | `ProfileScreen.js` |
| Información Personal | `PersonalInfoScreen.js` |
| Seguridad (2FA) | `SecurityScreen.js` |
| Guardados | `SavedScreen.js` |

## Cómo correrlo

Este entorno no tiene acceso a red, así que las dependencias no están instaladas.
En tu máquina, con Node.js instalado:

```bash
cd travexperience
npm install
npx expo start
```

Luego escanea el QR con la app **Expo Go** (Android/iOS) o presiona `w` para abrir en el navegador.

## Notas de diseño

- **Header** tiene dos variantes:
  - `variant="main"`: header oscuro (navy) con logo "TraveXperience" + campana de notificaciones. Se usa en la pantalla raíz de cada tab.
  - `variant="sub"`: header con flecha de regreso + título, con `tone` de fondo `amber` (dorado, historial) o `light` (blanco, Cartera/Guardados).
- **BottomNav** es un componente 100% independiente del Header, pasado a `Tab.Navigator` vía la prop `tabBar`.
- La pantalla de mapa (`DiscoverMapScreen`) usa una imagen estilizada con pines superpuestos en vez de `react-native-maps`, para no requerir configuración nativa adicional. Si quieres un mapa real, puedo integrar `react-native-maps` o `expo-location`.
- Los datos son mock (`src/data/mock.js`) — listos para conectar a tu API/backend.