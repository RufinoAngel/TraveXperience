# Build — TraveXperience Móvil

Esta carpeta contiene (o documenta cómo generar) los artefactos de compilación de la app móvil **TraveXperience**, desarrollada con **React Native + Expo (Expo Router)** y **NativeWind (Tailwind CSS)**.

## Requisitos previos

| Herramienta | Versión recomendada |
|---|---|
| Node.js | LTS más reciente (18.x o superior) |
| npm | Incluido con Node.js |
| Expo CLI | Se ejecuta vía `npx`, no requiere instalación global |
| Cuenta de Expo (EAS) | Necesaria para builds nativos (`eas build`) |
| Android Studio | Solo si se compila localmente para Android |
| Xcode (macOS) | Solo si se compila localmente para iOS |

## Instalación de dependencias

Desde la carpeta `frontend/` del proyecto:

```bash
npm install
```

## Compilar para desarrollo (Expo Go / dev client)

```bash
npx expo start
```

Si se hicieron cambios en configuración nativa (`app.json`, `babel.config.js`, `metro.config.js`) o se instaló una librería nueva, reiniciar con caché limpia:

```bash
npx expo start -c
```

## Compilar builds nativos (Android / iOS)

### Build local (requiere Android Studio / Xcode instalados)

```bash
npx expo run:android
npx expo run:ios
```

### Build en la nube con EAS (recomendado, no requiere Android Studio/Xcode)

```bash
npx eas build --profile development --platform android
npx eas build --profile development --platform ios
```

Para un build de producción (listo para tienda):

```bash
npx eas build --profile production --platform android
npx eas build --profile production --platform ios
```

## Estructura relevante del proyecto

```
frontend/
 ├─ src/
 │   ├─ app/            # Rutas de Expo Router (pantallas)
 │   ├─ components/     # Componentes reutilizables
 │   ├─ constants/
 │   ├─ hooks/
 │   └─ global.css      # Estilos base de Tailwind/NativeWind
 ├─ app.json            # Configuración de Expo (nombre, ícono, permisos, etc.)
 ├─ babel.config.js
 ├─ metro.config.js
 └─ package.json
```

## Salida de los builds

- Los builds de EAS quedan disponibles para descarga desde el dashboard de [expo.dev](https://expo.dev) o desde la URL que entrega la terminal al finalizar.
- Los builds locales (`expo run:android` / `expo run:ios`) generan el `.apk`/`.aab` o el `.app`/`.ipa` dentro de las carpetas nativas generadas (`android/` o `ios/`), las cuales no se versionan en el repositorio.

## Notas

- Este proyecto usa **Expo Router**: el nombre de cada archivo dentro de `src/app/` define automáticamente su ruta de navegación. Los nombres de archivo son sensibles a mayúsculas/minúsculas en Metro, aunque el sistema operativo (Windows) no lo sea — cuidado al crear o renombrar archivos.
- Los mapas de la app usan **Leaflet + OpenStreetMap** dentro de un WebView, no Google Maps, por lo que no se requiere ninguna API key para esa función.

---

## Equipo de Desarrollo

| Integrante | Contacto | Rol | Observaciones |
| :--- | :--- | :--- | :---: |
| Angel de Jesus Rufino Mendoza | [@RufinoAngel](https://github.com/RufinoAngel) | Líder del Proyecto y Desarrollador | ✅ Aprobado |
| Karen Lizbeth Negrete Hernández | [@KarenNegrete06](https://github.com/KarenNegrete06) | Lider de Documentación | Sin Revisar ❎ |
| Abril Guzman Barrera | [@Abrilgb](https://github.com/Abrilgb) | Lider de Fronted | Aprobado ✅ |
| Esther Gonzalez Peralta | [@Esther-Gonzalez04](https://github.com/Esther-Gonzalez04) | Líder del Base de datos | Aprobado ✅ |
