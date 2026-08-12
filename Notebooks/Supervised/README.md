# Supervised — Modelos Supervisados

Notebooks de prototipado de los modelos de TraveXperience que se entrenan con datos etiquetados/con variable objetivo conocida, a partir de los datasets ya explorados y limpiados en `EDA/` y disponibles en `Data/Processed`.

---

## Modelos que viven aquí

| Modelo | Objetivo | Variable objetivo | Features de entrada (referencia) |
|---|---|---|---|
| Estimación de presupuesto de viaje | Predecir/comparar el costo estimado de un itinerario | Costo real o rango de costo | Destino, duración, número de actividades, tipo de alojamiento, temporada |
| Validación de reseñas | Clasificar una reseña como confiable / no confiable | Etiqueta de confiabilidad | Texto de la reseña, calificación, comportamiento del autor, coherencia con el lugar/itinerario |

Estos dos modelos son los que respaldan las funcionalidades de **Gestión de Presupuestos** y **Sistema de Reseñas** descritas en el README raíz del proyecto.

---

## Qué debe cubrir cada notebook

- **Preparación**: carga de `Data/Training` / `Data/Validation` / `Data/Test`, encoding de variables categóricas, escalado si aplica.
- **Entrenamiento**: al menos un modelo base (baseline) y una versión ajustada/comparada con otro algoritmo.
- **Evaluación**: métricas explícitas según el tipo de problema (ej. MAE/RMSE para presupuesto, precisión/recall/F1 para validación de reseñas), consistentes con lo definido en `Docs/DS/ModelEvaluation`.
- **Umbral de aceptación**: el modelo solo pasa a `DataModels/Supervised_LMs` si cumple las métricas de precisión acordadas por el equipo (ver Gestión de la Calidad, README raíz).
- **Exportación**: conversión del modelo final a formato compatible con TensorFlow.js.

---

## Convenciones

- Nombrar los notebooks por modelo: `01_supervised_estimacion_presupuesto.ipynb`, `02_supervised_validacion_resenas.ipynb`.
- Registrar la versión y las métricas de cada corrida relevante (no solo la última).
- El artefacto entrenado final se guarda versionado en `DataModels/Supervised_LMs`, no en esta carpeta.
- Cualquier cambio de features o de variable objetivo debe reflejarse también en `Docs/DS/DataDictionary`.

---

*Parte del ecosistema TraveXperience — equipo NaviCore.*
