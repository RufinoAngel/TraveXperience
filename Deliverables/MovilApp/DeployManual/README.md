# Manual de Despliegue — TraveXperience Móvil

Este documento describe el proceso para desplegar la app móvil **TraveXperience** (Android e iOS), desde la preparación del entorno hasta la publicación en las tiendas de aplicaciones.

## 1. Requisitos previos

- Cuenta de [Expo](https://expo.dev) (para usar EAS Build y EAS Submit).
- Cuenta de **Google Play Console** (para publicar en Android).
- Cuenta de **Apple Developer Program** (para publicar en iOS), con costo anual vigente.
- Node.js LTS instalado en la máquina desde la que se despliega.
- Acceso al repositorio del proyecto con los permisos correspondientes.

## 2. Configuración del entorno

1. Clonar el repositorio y ubicarse en la carpeta `frontend/`.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Iniciar sesión en Expo desde la terminal:
   ```bash
   npx expo login
   ```
4. Verificar que `app.json` tenga configurados correctamente:
   - `name`, `slug`, `version`
   - `android.package` (identificador único, ej. `com.travexperience.app`)
   - `ios.bundleIdentifier`
   - Ícono y splash screen

## 3. Generar el build de producción

### Android

```bash
npx eas build --profile production --platform android
```

Esto genera un archivo `.aab` (Android App Bundle), formato requerido por Google Play.

### iOS

```bash
npx eas build --profile production --platform ios
```

Esto genera un archivo `.ipa`, firmado con las credenciales de Apple Developer configuradas en EAS.

> EAS puede gestionar automáticamente las credenciales de firma (keystore de Android, certificados de iOS) si se le indica durante el proceso interactivo del comando.

## 4. Publicar en las tiendas

### Google Play

Opción A — Automático con EAS Submit:
```bash
npx eas submit --platform android
```

Opción B — Manual:
1. Ingresar a Google Play Console.
2. Crear una nueva versión en la pista correspondiente (interna, cerrada, abierta o producción).
3. Subir el archivo `.aab` generado.
4. Completar la ficha de la tienda (descripción, capturas de pantalla, política de privacidad).
5. Enviar a revisión.

### App Store (iOS)

Opción A — Automático con EAS Submit:
```bash
npx eas submit --platform ios
```

Opción B — Manual:
1. Subir el `.ipa` a App Store Connect (vía Transporter o Xcode).
2. Completar la ficha de la app (descripción, capturas, clasificación por edad).
3. Enviar a revisión de Apple.

## 5. Actualizaciones posteriores (OTA)

Para cambios que **no** requieren una nueva build nativa (por ejemplo, ajustes de JS/estilos que no tocan configuración nativa), se pueden publicar actualizaciones "over-the-air" con:

```bash
npx eas update --branch production
```

Esto actualiza la app instalada en los dispositivos de los usuarios sin pasar por el proceso de revisión de las tiendas, siempre que el cambio sea compatible con OTA (no aplica para cambios que requieran recompilar código nativo, como agregar una nueva librería nativa).

## 6. Checklist antes de cada despliegue

- [ ] Se incrementó el número de versión (`version` en `app.json` y `versionCode`/`buildNumber` según la plataforma).
- [ ] Se probó la build en al menos un dispositivo físico Android y uno iOS.
- [ ] Se revisaron los formularios y validaciones críticas (login, registro, pagos).
- [ ] Se verificó que las URLs/API keys de producción estén configuradas (no las de desarrollo).
- [ ] Se documentaron los cambios de esta versión (changelog).

## 7. Rollback

En caso de detectar un problema crítico después de publicar:

- Si fue una actualización OTA: revertir con `eas update` publicando la versión anterior en la misma rama.
- Si fue un build nativo ya aprobado en tienda: despublicar la versión problemática desde Google Play Console / App Store Connect y publicar una nueva build corregida cuanto antes.

---

## Equipo de Desarrollo

| Integrante | Contacto | Rol | Observaciones |
| :--- | :--- | :--- | :---: |
| Angel de Jesus Rufino Mendoza | [@RufinoAngel](https://github.com/RufinoAngel) | Líder del Proyecto y Desarrollador | ✅ Aprobado |
| Karen Lizbeth Negrete Hernández | [@KarenNegrete06](https://github.com/KarenNegrete06) | Lider de Documentación | Sin Revisar ❎ |
| Abril Guzman Barrera | [@Abrilgb](https://github.com/Abrilgb) | Lider de Fronted | Aprobado ✅ |
| Esther Gonzalez Peralta | [@Esther-Gonzalez04](https://github.com/Esther-Gonzalez04) | Líder del Base de datos | Aprobado ✅ |
