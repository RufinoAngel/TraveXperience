# Tests - TraveXperience

## ¿Qué es?

`Tests` contiene todas las pruebas automatizadas de la plataforma TraveXperience, organizadas por nivel de verificación. Cubre desde la validación de datos de entrada hasta la verificación del comportamiento integral de los módulos del sistema.

Incluye:

- Datos de prueba sintéticos y semillas de base de datos para escenarios controlados.
- Scripts de extracción, transformación y carga (ETL) usados en la preparación de los conjuntos de datos de prueba.
- Modelos de prueba para validación de lógica de negocio y predicciones.
- Pruebas unitarias e de integración de la API REST propia (`/api/v1/*`).
- Pruebas de integración con los servicios externos: SendGrid, Google Maps Platform y OpenWeatherMap.

## Tecnología utilizada

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) ![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white) ![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)

---

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
│   │
│   └───Models
├───README.md
└───Docs
```

- `Tests/Data/` — datos de prueba y semillas para la base de datos
- `Tests/ETL/` — scripts de preparación y transformación de datos de prueba
- `Tests/Models/` — pruebas de lógica de modelos y cálculos de la plataforma
- `Tests/API/` — pruebas unitarias de los endpoints de la API REST propia
- `Tests/Integration/` — pruebas de integración con servicios externos

## Equipo de Desarrollo

| Integrante | Contacto | Rol | Observaciones |
|-------------|--------|----------|---------------|
|Angel de Jesus Rufino Mendoza|[@RufinoAngel](https://github.com/RufinoAngel)|Líder del Proyecto y Desarrollador|Aprobado ✅|
|Karen Lizbeth Negrete Hernández|[@KarenNegrete06](https://github.com/KarenNegrete06)|Lider de Documentación|Aprobado ✅|
|Abril Guzman Barrera|[@Abrilgb](https://github.com/Abrilgb)|Lider de Frontend|Sin Aprobado ✅|
|Esther Gonzalez Peralta|[@Esther-Gonzalez04](https://github.com/Esther-Gonzalez04)|Líder del Base de datos|Aprobado ✅|

## Observaciones generales

- Ejecutar la suite completa antes de realizar un merge a la rama `main`.
- Los datos de prueba no deben contener información personal real; usar únicamente datos sintéticos.
- Mantener la cobertura de pruebas de la API por encima del 80% en endpoints críticos (autenticación, geolocalización e itinerarios).
- Las pruebas de integración con servicios externos deben ejecutarse en entorno de staging con API Keys de prueba, nunca con las credenciales de producción.
