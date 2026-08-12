#  Data - TraveXperience

## ¿Qué es?

`Data` contiene los conjuntos de datos sintéticos y los scripts de semilla (*seed*) utilizados para poblar la base de datos en entornos de prueba. Estos datos simulan escenarios reales de uso de la plataforma sin comprometer información personal de usuarios reales.

Incluye:

- Usuarios de prueba con distintos perfiles: viajero local, turista nacional, familia y viajero de negocios.
- Lugares de interés simulados con coordenadas, categorías, horarios y calificaciones.
- Reseñas y calificaciones sintéticas para validar el cálculo de promedios y la moderación de contenido.
- Itinerarios de muestra para pruebas del módulo "Fuera de Casa".

## Tecnología utilizada

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) ![JSON](https://img.shields.io/badge/JSON-000000?style=for-the-badge&logo=json&logoColor=white)

## Estructura de carpetas


```text

├───Tests
│   │   
│   ├───API
│   │
│   ├───Data
│   │   README.md  
│   │
│   ├───ETL
│   │
│   ├───Integration
│   │
│   └───Models
├───README.md
└───Docs
```

- `seed_users.json` — perfiles de usuarios sintéticos por segmento
- `seed_places.json` — lugares de interés con coordenadas y metadatos
- `seed_reviews.json` — reseñas y calificaciones de muestra
- `seed_itineraries.json` — itinerarios de prueba con fechas y actividades
- `run_seeds.js` — script para cargar todos los datos de prueba en la base de datos

## Equipo de Desarrollo

| Integrante | Contacto | Rol | Observaciones |
|-------------|--------|----------|---------------|
|Angel de Jesus Rufino Mendoza|[@RufinoAngel](https://github.com/RufinoAngel)|Líder del Proyecto y Desarrollador|Sin Revisar ❎|
|Karen Lizbeth Negrete Hernández|[@KarenNegrete06](https://github.com/KarenNegrete06)|Lider de Documentación|Aprobado ✅|
|Abril Guzman Barrera|[@Abrilgb](https://github.com/Abrilgb)|Lider de Frontend|Aprobado ✅|
|Esther Gonzalez Peralta|[@Esther-Gonzalez04](https://github.com/Esther-Gonzalez04)|Líder del Base de datos|Aprobado ✅|

## Observaciones generales

- Los archivos de semilla no deben contener contraseñas reales ni datos personales identificables.
- Ejecutar `run_seeds.js` únicamente en entornos de desarrollo o staging, nunca en producción.
- Actualizar los archivos de semilla cuando se agreguen nuevos campos a los modelos de base de datos.

---
