# DataModels - TraveXperience

## ¿Qué es?

`DataModels` agrupa los modelos de inteligencia artificial y la documentación de *machine learning* que soportan el análisis de datos turísticos y el sistema de recomendaciones de la plataforma.

Incluye:

- Modelos supervisados para clasificación de reseñas y predicción de presupuestos.
- Modelos no supervisados para clustering de perfiles de viajeros y detección de patrones de viaje.
- Soporte de análisis para decisiones de recomendación basadas en las preferencias de los usuarios.

## Tecnología utilizada

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) ![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
## Estructura de carpetas

*Carpeta actual:* `DataModels/`

```text
Proyecto\
│   README.md
├───DataBases\
├───DataModels\
│   │   README.md   <-- estás aquí
│   │
│   ├───Supervised_LMs\
│   │       README.md
│   │       modelo_supervisado.json
│   │       modelo_supervisado.weights.bin
│   │
│   └───Unsupervised_LMs\
│           README.md
│           modelo_no_supervisado.json
│           modelo_no_supervisado.weights.bin
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


## Observaciones generales

- Mantener el control de versiones para reproducibilidad de las recomendaciones.

- Documentar los datos de entrenamiento, las variables (como ubicaciones, presupuestos o categorías) y las métricas de evaluación.

- Actualizar los modelos con los cambios en las librerías de JS y la base de datos de los lugares turísticos.
