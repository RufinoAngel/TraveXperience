# Modelos de Aprendizaje No Supervisado - TraveXperience

## ¿Qué es?

Esta carpeta contiene los modelos no supervisados diseñados para el clustering de usuarios, la segmentación de perfiles de viajeros y la detección de patrones ocultos o anomalías en los datos turísticos (como comportamientos atípicos en reseñas o fluctuaciones inusuales de precios).

## Tecnología utilizada

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) ![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)

## Estructura de carpetas

*Carpeta actual:* `DataModels/Unsupervised_LMs/`

```text
Proyecto\
│   README.md
├───DataBases\
├───DataModels\
│   │   README.md
│   │
│   ├───Supervised_LMs\
│   │       README.md
│   │       modelo_recomendacion_rutas.json
│   │       modelo_recomendacion_rutas.weights.bin
│   │
│   └───Unsupervised_LMs\
│           README.md   <-- estás aquí
│           modelo_clustering_viajeros.json
│           modelo_clustering_viajeros.weights.bin
│           modelo_deteccion_anomalias.json
├───Deliverables\
└───Docs\
```

- `DataModels/README.md`: documentación general del repositorio de modelos
- `Supervised_LMs/README.md`: información de modelos supervisados
- `Unsupervised_LMs/README.md`: información de modelos no supervisados

## Equipo de trabajo

| Integrante | Contacto | Rol | Observaciones | 
|---|---|---|---|
| Angel de Jesús Rufino Mendoza | [RufinoAngel](https://github.com/RufinoAngel) | Líder del proyecto y Desarrollo | ✅ Aprobado |
| Abril Guzman Barrera | [abrilgb](https://github.com/Abrilgb) | Líder de FrontEnd  | ❌No revisado |
| Karen Lizbeth Negrete Hernandez | [KarenNegrete06](https://github.com/karenNegrete06) | Líder de Documentación | ❌ No revisado |
| Esther Gonzalez Peralta | [Esther-Gonzalez](https://github.com/Esther-Gonzalez04) | Líder de Base de Datos  | ❌ No revisado |




## Observaciones

- Configuración: Describir cada método de clustering y su configuración paramétrica (ej. algoritmos de agrupación para recomendar destinos similares a usuarios que no tienen historial previo).

- Variables: Indicar qué perfil de viajeros, categorías de actividades o métricas de lugares se utilizaron para el entrenamiento (en lugar de datos clínicos).

- Formatos: Mantener la consistencia guardando la arquitectura en archivos .json y los pesos en .bin para garantizar su correcta ejecución e ingesta en el ecosistema de Node.js / TensorFlow.js.