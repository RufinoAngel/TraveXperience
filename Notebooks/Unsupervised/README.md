# Unsupervised — Modelos No Supervisados

Notebooks de prototipado de los modelos de TraveXperience que trabajan sin variable objetivo etiquetada, orientados principalmente al **motor de recomendación inteligente**.

---

## Modelos que viven aquí

| Modelo | Objetivo | Features de entrada (referencia) |
|---|---|---|
| Segmentación de perfiles de usuario | Agrupar usuarios con preferencias/comportamientos similares | Historial de búsquedas, categorías de interés, presupuesto habitual, ubicación |
| Clustering de destinos/lugares | Agrupar lugares y actividades con características afines | Categoría, ubicación, calificación, popularidad, rango de precio |

La combinación de ambos clusters (perfil de usuario ↔ tipo de destino) es la base sobre la que se construyen las **recomendaciones personalizadas** de los módulos "Cerca de Mí" y "Fuera de Casa".

---

## Qué debe cubrir cada notebook

- **Preparación**: selección y escalado de features desde `Data/Processed`.
- **Selección del algoritmo**: comparar al menos dos enfoques (ej. K-Means vs. clustering jerárquico) y justificar el número de clusters/segmentos.
- **Validación**: métricas propias de no supervisado (ej. silhouette score, inercia) según lo definido en `Docs/DS/ModelEvaluation`, ya que no hay una etiqueta "correcta" contra la cual comparar.
- **Interpretación**: describir en lenguaje de negocio qué representa cada cluster (ej. "usuarios de bajo presupuesto interesados en naturaleza"), para que el equipo de producto pueda usarlo en las reglas de recomendación.
- **Exportación**: conversión del modelo final a formato compatible con TensorFlow.js.

---

## Convenciones

- Nombrar los notebooks por modelo: `01_unsupervised_segmentacion_usuarios.ipynb`, `02_unsupervised_clustering_destinos.ipynb`.
- Documentar el número de clusters elegido y por qué, no solo el resultado final.
- El artefacto entrenado final se guarda versionado en `DataModels/Unsupervised_LMs`, no en esta carpeta.
- La interpretación de cada cluster debe quedar resumida en `Docs/DS/ModelEvaluation` para que el equipo de backend/frontend la use al implementar las reglas de recomendación.

---

*Parte del ecosistema TraveXperience — equipo NaviCore.*
