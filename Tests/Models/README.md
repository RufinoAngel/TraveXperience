# Models - TraveXperience

## ¿Qué es?

`Models` contiene las pruebas unitarias orientadas a verificar la lógica de los modelos de datos y los cálculos de negocio de la plataforma. Se enfoca en validar que las reglas de cómputo definidas en la especificación de reglas de negocio (RN-COL-04, RN-FDC-06) se apliquen correctamente en el sistema.

Incluye:

- Pruebas del cálculo de calificación promedio de lugares (media aritmética con umbral mínimo de 3 reseñas).
- Pruebas del cálculo de duración estimada de itinerarios (sumatoria de tiempos de visita y traslado).
- Pruebas de la lógica de priorización de resultados en el módulo "Cerca de Mí" (calificación + proximidad).
- Pruebas del motor de recomendaciones personalizadas basado en el historial colaborativo del usuario.

## Tecnología utilizada

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) ![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

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
│   │   README.md  
│   │
├───README.md
└───Docs

```

- `test_ratings.js` — valida el cálculo del promedio de calificaciones y el umbral mínimo de 3 reseñas
- `test_itinerary_duration.js` — verifica la sumatoria de tiempos de visita y traslado en itinerarios
- `test_nearby_ranking.js` — comprueba el algoritmo de priorización de resultados por calificación y distancia
- `test_recommendations.js` — prueba la generación de recomendaciones basadas en el historial del usuario

## Equipo de Desarrollo

| Integrante | Contacto | Rol | Observaciones |
|-------------|--------|----------|---------------|
|Angel de Jesus Rufino Mendoza|[@RufinoAngel](https://github.com/RufinoAngel)|Líder del Proyecto y Desarrollador|Sin Revisar ❎|
|Karen Lizbeth Negrete Hernández|[@KarenNegrete06](https://github.com/KarenNegrete06)|Lider de Documentación|Aprobado ✅|
|Abril Guzman Barrera|[@Abrilgb](https://github.com/Abrilgb)|Lider de Frontend|Aprobado ✅|
|Esther Gonzalez Peralta|[@Esther-Gonzalez04](https://github.com/Esther-Gonzalez04)|Líder del Base de datos|Aprobado ✅|

## Observaciones generales

- Cada archivo de prueba debe cubrir los casos límite definidos en las reglas de negocio (por ejemplo, lugares con menos de 3 reseñas no deben mostrar promedio).
- Documentar los valores de entrada y salida esperados en cada caso de prueba.
- Actualizar las pruebas cuando se modifiquen las fórmulas de cálculo en la especificación de reglas de negocio.

---