# Reglas de Simulación de Datos Sintéticos

**Carpeta de código**: `Simulation/`
**Usado por**: `scripts/trainBudgetModel.js`, `scripts/trainClusteringModel.js`

## ¿Por qué existen datos sintéticos?

Ambos modelos de TravExperience necesitan un volumen mínimo de datos
reales para entrenar de forma confiable. Al inicio del proyecto (o en
cualquier entorno de desarrollo/pruebas nuevo) es normal no tener
todavía suficientes itinerarios o usuarios reales. En vez de bloquear el
desarrollo, los scripts completan lo que falta con datos sintéticos
generados con reglas conocidas y documentadas — nunca con valores
aleatorios sin sentido.

**Regla general**: los datos sintéticos son un puente temporal, no un
reemplazo permanente. Cada script imprime una advertencia (`logger.warn`)
indicando cuántos ejemplos sintéticos se usaron, para que quede
explícito en los logs cuándo el modelo NO se entrenó 100% con datos
reales.

---

## 1. Presupuesto de itinerarios (`generate_synthetic_itineraries.js`)

**Umbral**: `MIN_REAL_SAMPLES = 30`. Si hay menos de 30 itinerarios
reales utilizables (con `estimatedBudget`, `startDate` y `endDate`
válidos), se completa hasta `MIN_REAL_SAMPLES * 3` ejemplos totales con
datos sintéticos.

**Regla de generación**:

| Variable | Rango / Fórmula |
|---|---|
| `durationDays` | Entero uniforme entre 1 y 14 días |
| `numActivities` | Entero uniforme entre 0 y 9 actividades |
| `budget` | `durationDays * 650 + numActivities * 200 + ruido` |
| `ruido` | Uniforme entre -200 y +200 MXN |
| Piso mínimo | El presupuesto nunca baja de $300 MXN |

**Justificación de los coeficientes** ($650/día, $200/actividad): son
estimaciones razonables de gasto diario promedio de un turista nacional
en México (hospedaje + alimentos + transporte local) y de costo
promedio por actividad/tour, usadas como punto de partida mientras no
hay suficiente historial real para calibrar estos valores con datos
propios.

**Caso extremo a vigilar**: un viaje de 1 día con 0 actividades genera un
presupuesto cercano al piso de $300 — validado en
`tests/Data/itineraries_clean.test.js` (que exige `estimatedBudget > 0`
siempre).

---

## 2. Preferencias de usuario (`generate_synthetic_users.js`)

**Umbral**: `MIN_REAL_USERS = 40`. Si hay menos de 40 usuarios reales con
`travelPreferences` declarado, se completa hasta `MIN_REAL_USERS * 2`
usuarios sintéticos.

**Regla de generación** (antes de normalizar):

| Variable | Rango / Fórmula |
|---|---|
| `avgBudget` | Uniforme entre $1,000 y $16,000 MXN |
| `age` | Uniforme entre 18 y 73 años |
| `interesAventura` | Booleano, 50% de probabilidad |
| `interesCultura` | Booleano, 50% de probabilidad |
| `viajaSolo` | Booleano, 40% de probabilidad (60% de que NO viaje solo) |

**Normalización aplicada** (la misma función `toFeatureVector` se usa
tanto para datos sintéticos como reales — es crítico que ambos casos
pasen por la misma normalización, o el modelo entrenaría con una escala
distinta a la que ve en producción):

- `avgBudget` → `min(avgBudget / 20000, 1)`
- `age` → `min(age / 80, 1)`
- Los 3 campos booleanos ya son 0/1 directamente.

**Por qué 60% "no viaja solo"**: se asume, sin datos reales todavía, que
la mayoría de los viajes se planean en pareja/familia/grupo — esto debe
revisarse en cuanto haya datos reales (ver pendiente abajo).

---

## Qué hacer cuando ya haya suficientes datos reales

1. Verificar en los logs de `trainBudgetModel.js` /
   `trainClusteringModel.js` que la advertencia de datos sintéticos ya
   no aparece (o que el número de sintéticos usados es 0).
2. Si se quiere forzar el uso exclusivo de datos reales incluso por
   debajo del umbral (por ejemplo, para una prueba controlada), se puede
   llamar a `loadRealData()` / la consulta a `User` directamente sin
   pasar por el fallback — no está expuesto como flag hoy, pero es un
   cambio menor si se necesita.
3. Revisar si los supuestos de este documento (coeficientes de
   presupuesto, proporción de "viaja solo", etc.) siguen siendo
   razonables comparados con el comportamiento real observado, y
   documentar cualquier diferencia relevante aquí mismo.
