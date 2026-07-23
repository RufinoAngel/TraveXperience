#  API - TraveXperience

## ¿Qué es?

`API` contiene las pruebas unitarias de los endpoints de la API REST propia de TraveXperience (`/api/v1/*`). Verifica que cada endpoint responda con el código HTTP correcto, el formato de datos esperado y el comportamiento definido en las reglas de negocio, tanto en escenarios de éxito como en casos de error y validación.

Incluye:

- Pruebas del módulo de autenticación: registro, verificación, login, refresh de token y recuperación de contraseña.
- Pruebas del módulo "Cerca de Mí": búsqueda por coordenadas, filtros y límite de resultados.
- Pruebas del módulo "Fuera de Casa": búsqueda de destinos, validación de fechas, gestión de itinerarios y consulta de clima.
- Pruebas del módulo colaborativo: publicación, edición y eliminación de reseñas, y cálculo de calificación promedio.

## Tecnología utilizada

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) ![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white) ![Supertest](https://img.shields.io/badge/Supertest-grey?style=for-the-badge)

## Estructura de carpetas

*Carpeta actual:* `Tests/API/`

```text
Tests\
│   README.md
├───Data\
├───ETL\
├───Models\
├───API\
│   │   README.md   <-- estás aquí
│   │   auth.test.js
│   │   users.test.js
│   │   nearby.test.js
│   │   trips.test.js
│   │   reviews.test.js
│
└───Integration\

├───Tests
│   │   
│   ├───API
│   │   README.md  
│   │
│   ├───Data
│   │
│   ├───ETL
│   │
│   ├───Integration
│   │
│   └───Models
├───README.md
└───Docs

```

- `auth.test.js` — pruebas de registro, login, verificación de cuenta y recuperación de contraseña
- `users.test.js` — pruebas de consulta y actualización de perfil y preferencias
- `nearby.test.js` — pruebas de búsqueda de lugares cercanos con distintos filtros y radios
- `trips.test.js` — pruebas de búsqueda de destinos, creación y validación de itinerarios
- `reviews.test.js` — pruebas de publicación, edición, eliminación y calificación promedio

## Equipo de Desarrollo

| Integrante | Contacto | Rol | Observaciones |
|-------------|--------|----------|---------------|
|Angel de Jesus Rufino Mendoza|[@RufinoAngel](https://github.com/RufinoAngel)|Líder del Proyecto y Desarrollador|Sin Revisar ❎|
|Karen Lizbeth Negrete Hernández|[@KarenNegrete06](https://github.com/KarenNegrete06)|Lider de Documentación|Aprobado ✅|
|Abril Guzman Barrera|[@Abrilgb](https://github.com/Abrilgb)|Lider de Frontend|Aprobado ✅|
|Esther Gonzalez Peralta|[@Esther-Gonzalez04](https://github.com/Esther-Gonzalez04)|Líder del Base de datos|Aprobado ✅|

## Observaciones generales

- Todas las pruebas de endpoints privados deben incluir un token JWT válido generado con datos de prueba.
- Cubrir siempre los escenarios de error: credenciales incorrectas, parámetros faltantes, acceso no autorizado y recursos inexistentes.
- Mantener las pruebas independientes entre sí; cada prueba debe configurar y limpiar su propio estado en la base de datos de prueba.

---