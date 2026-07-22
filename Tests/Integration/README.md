# Integration - TraveXperience

## ¿Qué es?

`Integration` contiene las pruebas de integración con los tres servicios web externos que consume la plataforma TraveXperience: SendGrid (correo transaccional), Google Maps Platform (geolocalización y lugares) y OpenWeatherMap (clima de destinos). Verifica que la comunicación entre la API REST propia y cada servicio externo funcione correctamente bajo condiciones controladas.

Incluye:

- Pruebas del flujo de envío de correos de verificación y recuperación de contraseña mediante SendGrid.
- Pruebas de la integración con Google Maps Places API y Geocoding API para el módulo "Cerca de Mí".
- Pruebas de la integración con OpenWeatherMap para la consulta del pronóstico del tiempo en itinerarios.
- Verificación del manejo de errores ante fallos o respuestas inesperadas de los servicios externos.

## Tecnología utilizada

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) ![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white) ![SendGrid](https://img.shields.io/badge/SendGrid-1A82E2?style=for-the-badge&logo=sendgrid&logoColor=white)

## Estructura de carpetas


```text
├───Tests
│   │   
│   ├───API
│   │
│   ├───Data 
│   │
│   ├───ETL
│   │
│   ├───Integration
│   │   README.md 
│   │
│   └───Models
├───README.md
└───Docs

```

- `sendgrid.test.js` — valida el envío de correos de verificación y recuperación a través de SendGrid
- `googlemaps.test.js` — verifica la búsqueda de lugares cercanos y la geocodificación de direcciones
- `openweather.test.js` — comprueba la obtención y filtrado del pronóstico del tiempo para destinos
- `mocks/` — simulaciones de las respuestas de los servicios externos para pruebas sin consumir cuotas reales

## Equipo de Desarrollo

| Integrante | Contacto | Rol | Observaciones |
|-------------|--------|----------|---------------|
|Angel de Jesus Rufino Mendoza|[@RufinoAngel](https://github.com/RufinoAngel)|Líder del Proyecto y Desarrollador|Sin Revisar ❎|
|Karen Lizbeth Negrete Hernández|[@KarenNegrete06](https://github.com/KarenNegrete06)|Lider de Documentación|Aprobado ✅|
|Abril Guzman Barrera|[@Abrilgb](https://github.com/Abrilgb)|Lider de Frontend|Sin Revisar ❎|
|Esther Gonzalez Peralta|[@Esther-Gonzalez04](https://github.com/Esther-Gonzalez04)|Líder del Base de datos|Aprobado ✅|

## Observaciones generales

- Las pruebas de integración deben ejecutarse con API Keys de entorno de prueba almacenadas en variables de entorno, nunca con credenciales de producción.
- Utilizar los mocks para la ejecución en CI/CD y reservar las pruebas contra los servicios reales para validaciones manuales en staging.
- Documentar el comportamiento esperado ante errores de los servicios externos (timeouts, límites de cuota, respuestas 4xx/5xx).

---