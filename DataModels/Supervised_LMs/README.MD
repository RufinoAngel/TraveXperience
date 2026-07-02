# Modelos de Aprendizaje Supervisado - TraveXperience

## ¿Qué es?

Esta carpeta contiene los modelos supervisados entrenados con datos etiquetados para clasificación de reseñas turísticas, predicción de presupuestos de viaje y sistemas de recomendación personalizada de actividades locales y foráneas.

## Tecnología utilizada

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) ![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)

## Estructura de carpetas

*Carpeta actual:* `DataModels/Supervised_LMs/`

```text
Proyecto\
│   README.md
├───DataBases\
├───DataModels\
│   │   README.md
│   │
│   ├───Supervised_LMs\
│   │       README.md   <-- estás aquí
│   │       modelo_recomendacion_rutas.json
│   │       modelo_recomendacion_rutas.weights.bin
│   │       modelo_clasificacion_resenas.json
│   │       modelo_clasificacion_resenas.weights.bin
│   │
│   └───Unsupervised_LMs\
│           README.md
│           modelo_clustering_usuarios.json
│           modelo_descubrimiento_lugares.json
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
| Abril Guzman Barrera | [abrilgb](https://github.com/Abrilgb) | Líder de FrontEnd  | ✅ Aprobado |
| Karen Lizbeth Negrete Hernandez | [KarenNegrete06](https://github.com/karenNegrete06) | Líder de Documentación | ✅ Aprobado |
| Esther Gonzalez Peralta | [Esther-Gonzalez](https://github.com/Esther-Gonzalez04) | Líder de Base de Datos  | ✅ Aprobado |



## Observaciones

Métricas: Incluir métricas de precisión, recall, F1 y AUC para los modelos de clasificación de reseñas y recomendaciones.

Datasets: Agregar notas específicas sobre los conjuntos de datos utilizados (ej. historial de preferencias de los usuarios, calificaciones de lugares [1-5 estrellas], rangos de precios)[cite: 1].

Formatos: Mantener el formato de guardado de los modelos en .json (topología del modelo) y .bin (pesos) propios de TensorFlow.js para facilitar su integración directa y ejecución eficiente.

Privacidad: Asegurar que los datos de entrenamiento no expongan información personal sensible (como ubicaciones exactas en tiempo real de usuarios individuales sin anonimizar).