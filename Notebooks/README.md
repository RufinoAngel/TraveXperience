# Notebooks — TraveXperience

Este directorio concentra el trabajo exploratorio y de modelado que sustenta el **motor de recomendación inteligente** de TraveXperience: el análisis de datos y el prototipado de los modelos de Machine Learning antes de que se conviertan en artefactos entrenados (`DataModels/Serialized`) y se integren al backend vía **TensorFlow.js**.

---

## Propósito

TraveXperience necesita entender el comportamiento y las preferencias de sus usuarios (historial de búsquedas, itinerarios creados, reseñas, presupuestos) para poder ofrecer:

- **Recomendaciones personalizadas** de destinos, lugares y actividades (módulos "Cerca de Mí" y "Fuera de Casa").
- **Estimaciones y comparativas de presupuesto** de viaje.
- **Validación de reseñas**, para detectar opiniones poco confiables antes de que influyan en las recomendaciones a otros usuarios.

Los notebooks son el espacio de trabajo donde se explora, se prueba y se valida cada uno de estos modelos **antes** de que pasen a `DataModels/` como artefacto serializado y, de ahí, al backend.

---

## Estructura

```
Notebooks/
├── EDA/
├── Supervised/
└── Unsupervised/
```

| Carpeta | Contenido | Alimenta a |
|---|---|---|
| `EDA/` | Análisis exploratorio de los datos crudos (`Data/Raw`) y procesados (`Data/Processed`): distribución de usuarios, itinerarios, reseñas, presupuestos y lugares por categoría. Aquí se detectan valores faltantes, outliers y se justifican las decisiones de limpieza/feature engineering. | Insumo para las dos carpetas siguientes |
| `Supervised/` | Modelos entrenados con etiquetas conocidas: por ejemplo, estimación de presupuesto de viaje a partir de las características del itinerario, o clasificación de reseñas como confiables/no confiables. | `DataModels/Supervised_LMs` |
| `Unsupervised/` | Modelos sin etiquetas: segmentación de perfiles de usuario y clustering de destinos/lugares con características similares, base del motor de recomendación. | `DataModels/Unsupervised_LMs` |

---

## Flujo de trabajo

1. **EDA** sobre los datos disponibles en `Data/Raw` → se documentan hallazgos y decisiones de limpieza.
2. Los datos limpios/transformados se guardan en `Data/Processed` (y, si aplica, se dividen en `Data/Training`, `Data/Validation`, `Data/Test`).
3. Se prototipa el modelo correspondiente en `Supervised/` o `Unsupervised/`, documentando métricas de evaluación (ver `Docs/DS/ModelEvaluation`).
4. Una vez que el modelo cumple con las métricas de precisión establecidas por el equipo (ver Gestión de la Calidad en el README raíz), se exporta y se versiona en `DataModels/Serialized`, listo para su conversión/uso con TensorFlow.js en la API.

---

## Convenciones

- Nombrar los notebooks con prefijo numérico + descripción corta: `01_eda_usuarios.ipynb`, `02_supervised_estimacion_presupuesto.ipynb`, `03_unsupervised_clustering_destinos.ipynb`.
- Cada notebook debe iniciar con una celda markdown que indique: objetivo, dataset(s) de entrada y salida esperada.
- No commitear datasets pesados dentro de `Notebooks/`; deben vivir en `Data/` y ser referenciados por ruta relativa.
- Cualquier modelo que pase de prototipo a candidato de producción debe quedar reflejado también en `Docs/DS/ModelEvaluation`.

---

## Dependencias

Definidas en `requirements.txt` en la raíz del repositorio (pandas, scikit-learn, TensorFlow/TensorFlow.js converter, herramientas de visualización, entre otras).

---

*Parte del ecosistema TraveXperience — Universidad Tecnológica de Xicotepec de Juárez, equipo NaviCore.*
