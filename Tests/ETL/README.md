# ETL - TraveXperience

## ¿Qué es?

`ETL` (Extract, Transform, Load) contiene los scripts encargados de la extracción, transformación y carga de datos utilizados en los procesos de prueba de la plataforma. Estos scripts preparan los conjuntos de datos brutos para que sean compatibles con el esquema de base de datos de TraveXperience y con los formatos esperados por los módulos del sistema.

Incluye:

- Extracción de datos de fuentes externas o archivos brutos para su uso en pruebas.
- Transformación y normalización de datos: limpieza, conversión de formatos, validación de coordenadas y estandarización de categorías de lugares.
- Carga de los datos transformados en la base de datos de prueba mediante scripts automatizados.

## Tecnología utilizada

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) ![CSV](https://img.shields.io/badge/CSV-217346?style=for-the-badge&logo=microsoftexcel&logoColor=white)

## Estructura de carpetas

*Carpeta actual:* `Tests/ETL/`

```text

├───Tests
│   │   
│   ├───API
│   │
│   ├───Data 
│   │
│   ├───ETL
│   │   README.md 
│   │
│   ├───Integration
│   │
│   └───Models
├───README.md
└───Docs

```

- `etl_pipeline.js` — orquestador principal que ejecuta el flujo ETL completo en secuencia
- `extract_places.js` — extrae datos de lugares desde archivos CSV o fuentes externas
- `transform_places.js` — normaliza coordenadas, categorías y horarios al esquema de la plataforma
- `load_places.js` — carga los datos transformados en la base de datos de prueba
- `transform_users.js` — transforma y valida perfiles de usuario de prueba

## Equipo de Desarrollo

| Integrante | Contacto | Rol | Observaciones |
|-------------|--------|----------|---------------|
|Angel de Jesus Rufino Mendoza|[@RufinoAngel](https://github.com/RufinoAngel)|Líder del Proyecto y Desarrollador|Sin Revisar ❎|
|Karen Lizbeth Negrete Hernández|[@KarenNegrete06](https://github.com/KarenNegrete06)|Lider de Documentación|Aprobado ✅|
|Abril Guzman Barrera|[@Abrilgb](https://github.com/Abrilgb)|Lider de Frontend|Sin Revisar ❎|
|Esther Gonzalez Peralta|[@Esther-Gonzalez04](https://github.com/Esther-Gonzalez04)|Líder del Base de datos|Aprobado ✅|

## Observaciones generales

- Documentar cualquier transformación no trivial con comentarios en el código.
- Los scripts ETL deben ser idempotentes: ejecutarlos múltiples veces no debe generar duplicados en la base de datos.
- Verificar la integridad de los datos después de cada carga consultando los registros insertados.

---