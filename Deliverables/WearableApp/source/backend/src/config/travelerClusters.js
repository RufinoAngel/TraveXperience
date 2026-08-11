/**
 * src/config/travelerClusters.js
 * -----------------------------------------------------------------------
 * Traduce el índice de cluster (0..N_CLUSTERS-1) que devuelve el modelo
 * de src/ai-models/clustering-model/ a un nombre legible para el usuario.
 *
 * HISTORIAL DEL PROBLEMA:
 * scripts/trainClusteringModel.js entrena la red clasificadora sobre las
 * etiquetas que produce un k-means interno. k-means NO asigna un
 * significado fijo al índice de cada cluster, y además los centroides
 * originales nunca se persistieron (ver reporte de entrega anterior):
 * Simulation/generate_synthetic_users.js#toFeatureVector, que normalizaba
 * las features de entrenamiento, no está incluido en este repositorio.
 * El mapeo ['Aventurero', 'Cultural', 'Relax', 'Familiar'] que traía este
 * archivo era un PLACEHOLDER sin verificar contra el modelo real.
 *
 * CÓMO SE VALIDÓ ESTA VERSIÓN (ver scripts/analyzeClusteringModel.js,
 * reproducible en cualquier momento):
 * Como no se pueden recuperar los centroides originales, se analizó la
 * red YA ENTRENADA (los pesos reales de model.json/weights.bin) barriendo
 * el espacio de entrada [0,1]^5 y observando qué cluster gana en cada
 * región. Esto no es una suposición: depende únicamente de los pesos
 * guardados. Resultado (barrido completo en todo el rango de budget/age):
 *
 *   - adventureInterest = 1  -> SIEMPRE gana el cluster 1, sin importar
 *     cultureInterest, soloTravelPreference, budget ni age.
 *   - adventureInterest = 0 y cultureInterest = 0 -> SIEMPRE gana el
 *     cluster 3, sin importar soloTravelPreference, budget ni age.
 *   - adventureInterest = 0 y cultureInterest = 1 -> se divide entre el
 *     cluster 2 (soloTravelPreference bajo, es decir viaja acompañado) y
 *     el cluster 0 (soloTravelPreference alto, viaja solo), con el corte
 *     alrededor de soloTravelPreference ≈ 0.55.
 *
 * ⚠️ "Familiar" NO es un cluster real y se retira del mapeo: el vector de
 * entrada del modelo ([budget, age, adventureInterest, cultureInterest,
 * soloTravelPreference]) no contiene ninguna señal sobre viajar con
 * hijos/familia, así que es matemáticamente imposible que la red haya
 * aprendido a distinguir "Relax" de "Familiar" — de hecho el cluster 3
 * agrupa por igual a viajeros solos y acompañados sin interés declarado
 * en aventura o cultura. Si el negocio quiere recuperar "Familiar" como
 * categoría real, hace falta:
 *   1. Agregar un campo de preferencia explícito (ej. travelsWithChildren)
 *      a travelPreferences y al vector de features.
 *   2. Reentrenar con scripts/trainClusteringModel.js.
 *   3. Re-correr scripts/analyzeClusteringModel.js para confirmar que el
 *      nuevo cluster efectivamente se separa por esa señal antes de
 *      nombrarlo "Familiar" en producción.
 *
 * Si el modelo se reentrena, los índices pueden volver a moverse (el
 * orden de un k-means no es estable entre corridas) — hay que re-correr
 * scripts/analyzeClusteringModel.js y actualizar CLUSTER_LABELS de nuevo.
 * -----------------------------------------------------------------------
 */

const CLUSTER_LABELS = ['Cultural (solitario)', 'Aventurero', 'Cultural (en grupo)', 'Relax'];

/**
 * @param {number} clusterIndex
 * @returns {string} nombre legible, o "Desconocido" si el índice no es válido.
 */
const getClusterLabel = (clusterIndex) => CLUSTER_LABELS[clusterIndex] ?? 'Desconocido';

module.exports = { CLUSTER_LABELS, getClusterLabel };
