# Serialized — Modelos Entrenados de TraveXperience

Artefactos finales de Machine Learning, ya entrenados y validados en `Notebooks/Supervised` y `Notebooks/Unsupervised`, listos para integrarse a la API mediante **TensorFlow.js**.

Esta carpeta es el punto de entrega entre el trabajo de modelado (`Notebooks/`, `DataModels/Supervised_LMs`, `DataModels/Unsupervised_LMs`) y el consumo en producción por parte de `Deliverables/API`.

---

## Qué se guarda aquí

| Modelo | Origen | Uso en producción |
|---|---|---|
| Estimación de presupuesto de viaje | `Notebooks/Supervised` | Módulo de Gestión de Presupuestos |
| Validación de reseñas | `Notebooks/Supervised` | Sistema de Reseñas |
| Segmentación de perfiles de usuario | `Notebooks/Unsupervised` | Motor de Recomendaciones ("Cerca de Mí" / "Fuera de Casa") |
| Clustering de destinos/lugares | `Notebooks/Unsupervised` | Motor de Recomendaciones ("Cerca de Mí" / "Fuera de Casa") |

Solo llegan aquí los modelos que **ya cumplieron** las métricas de precisión establecidas por el equipo (ver Gestión de la Calidad en el README raíz del proyecto) y que fueron convertidos a un formato consumible por TensorFlow.js.

---

## Criterios para publicar un modelo aquí

1. El notebook de origen documenta las métricas de evaluación finales (`Docs/DS/ModelEvaluation`).
2. El modelo fue convertido a `model.json` + archivos de pesos (`tensorflowjs_converter` u otra herramienta equivalente), no se sube el modelo en su formato nativo de entrenamiento (`.pkl`, `.h5`, etc.) sin convertir.
3. Se versiona el modelo (no se sobrescribe silenciosamente uno anterior) para poder hacer rollback si una nueva versión reduce la precisión en producción.
4. Se actualiza la referencia correspondiente en `Docs/DS/ModelEvaluation` indicando qué versión está activa en la API.

---

## Convenciones de nombrado

```
Serialized/
├── budget-estimator/
│   └── v1/
│       ├── model.json
│       └── group1-shard1of1.bin
├── review-validator/
│   └── v1/
├── user-segmentation/
│   └── v1/
└── destination-clustering/
    └── v1/
```

- Un subdirectorio por modelo, con nombre en `kebab-case` describiendo su función (no el algoritmo usado).
- Una subcarpeta por versión (`v1`, `v2`, ...) dentro de cada modelo, para mantener historial y permitir rollback.
- El backend (`Deliverables/API`) consume siempre la ruta de la versión marcada como activa en la documentación.

---

## Importante

- **No** se editan modelos directamente aquí: cualquier cambio implica volver al notebook correspondiente, reentrenar, revalidar y volver a exportar.
- Archivos de pesos grandes deben manejarse con Git LFS (o equivalente) si el tamaño del repositorio lo requiere.

---

*Parte del ecosistema TraveXperience — equipo NaviCore.*
