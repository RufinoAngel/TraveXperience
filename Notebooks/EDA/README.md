# EDA — Análisis Exploratorio de Datos

Notebooks de exploración inicial de los datos de TraveXperience, previos a cualquier modelado. El objetivo es entender la calidad, distribución y relaciones de los datos generados por el uso de la plataforma antes de diseñar los modelos de `Supervised/` y `Unsupervised/`.

---

## Fuentes de datos exploradas

| Fuente | Contenido | Relevancia |
|---|---|---|
| Perfiles de usuario | Preferencias, historial de búsquedas, ubicación | Base para segmentación de perfiles (clustering) |
| Itinerarios | Destinos, actividades, duración, costos estimados vs. reales | Base para estimación de presupuesto |
| Lugares/actividades | Categoría, ubicación, calificación, popularidad | Base para el motor de recomendación |
| Reseñas | Texto, calificación, autor, itinerario/lugar asociado | Base para el modelo de validación de reseñas |

Los datos crudos se leen desde `Data/Raw`; cualquier transformación que se decida aplicar (limpieza, normalización, manejo de nulos) se documenta aquí antes de escribirse en `Data/Processed`.

---

## Qué debe cubrir cada notebook de EDA

- **Calidad de datos**: valores faltantes, duplicados, inconsistencias entre MySQL y MongoDB.
- **Distribución**: rangos de presupuesto, categorías de lugares más frecuentes, densidad geográfica de los destinos.
- **Relaciones**: correlación entre variables de itinerario y presupuesto real; relación entre calificación de reseña y características del lugar.
- **Detección de outliers**: itinerarios o reseñas atípicas que podrían sesgar el entrenamiento.
- **Conclusión accionable**: qué variables/features se recomienda usar en `Supervised/` y `Unsupervised/`, y qué limpieza se debe aplicar antes.

---

## Convenciones

- Nombrar los notebooks como `01_eda_usuarios.ipynb`, `02_eda_itinerarios.ipynb`, `03_eda_lugares.ipynb`, `04_eda_resenas.ipynb`, etc.
- Cada notebook inicia con una celda markdown indicando el dataset de entrada (`Data/Raw/...`) y el hallazgo principal que se busca.
- Los datasets resultantes de la limpieza se guardan en `Data/Processed`, nunca dentro de esta carpeta.
- Toda decisión de limpieza que afecte a los modelos posteriores debe quedar resumida en `Docs/DS/DataSources` o `Docs/DS/DataDictionary`.

---

*Parte del ecosistema TraveXperience — equipo NaviCore.*
