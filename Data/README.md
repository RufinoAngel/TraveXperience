# Data
<p align="center">
<img src="https://img.shields.io/badge/CSV-217346?style=for-the-badge&logo=csv&logoColor=white">
<img src="https://img.shields.io/badge/JSON-000000?style=for-the-badge&logo=json&logoColor=white">
<img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white">
</p>

Esta carpeta contiene todos los conjuntos de datos utilizados a lo largo del ciclo de vida del proyecto, desde su obtención hasta su uso en los modelos de extracción de conocimiento. Se organiza siguiendo las distintas etapas del flujo de datos: datos crudos, datos procesados, y las particiones necesarias para el entrenamiento, validación, prueba e inferencia de los modelos.

## Estructura de Archivos

```
ECBD_9B_IDGS-PC-Hospital-RH-Karencios
│
├── DataBases
│   ├── ETL
│   ├── NoSQL
│   ├── Seeds
│   ├── SQL
│   └── Warehouse
│
├── DataModels
├── Data ← Carpeta actual
│   ├── Raw
│   ├── Processed
│   ├── Training
│   ├── Validation
│   ├── Test
│   └── Inference
│
├── Deliverables
├── Docs
└── README.md
```

## Descripción de Subcarpetas

| Carpeta | Descripción |
|---------|-------------|
| `Raw` | Datos crudos, tal como fueron obtenidos, sin procesamiento. |
| `Processed` | Datos limpios, transformados y listos para su uso. |
| `Training` | Conjunto de entrenamiento para los modelos. |
| `Validation` | Conjunto de validación para ajuste de hiperparámetros. |
| `Test` | Conjunto de prueba para evaluación final de los modelos. |
| `Inference` | Datos nuevos utilizados para generar predicciones. |

## Equipo de Desarrollo

| Integrante | Contacto | Rol | Observaciones |
|------------|----------|------|---------------|
| Esther González Peralta | [Esther González Peralta](https://github.com/Esther-Gonzalez04) | Líder de Base de Datos | Aprobado ✅ |
| Ángel de Jesús Rufino Mendoza | [Ángel de Jesús Rufino Mendoza](https://github.com/RufinoAngel) | Líder del proyecto y Desarrollo  | Sin revisar |
| Abril Guzmán Barrera | [Abril Guzmán Barrera](https://github.com/Abrilgb) | Líder de FrontEnd | Sin revisar |
| Karen Lizbeth Negrete Hernández | [Karen Lizbeth Negrete Hernández](https://github.com/karenNegrete06) | Líder de Documentación | Sin revisar |
