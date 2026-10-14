# Evidencia — práctica de navegación
Repositorio: https://github.com/AustinHam666/guardia-sigilo-piapc-2026
Commit inicial: `e87d7553c7f1e1a8d8f20c3f9ec824f2454b2047`
Commit de implementación: `6eec4c5` (incremento 2; incremento 1 en `2cdfde8`, línea base y spec/plan en `a61089a`)
Versión de entrega: commit final informado por el estudiante en la plataforma.
Variante: A — terreno lento
Herramienta/modelo o trabajo manual: Claude (Claude Opus 5.5) como agente de desarrollo, conducido y revisado por el estudiante. Entorno: Linux, Node v22.22.0; repetible en Windows con Node v24.
Cambios previos: cinco upgrades de la clase 8 (`docs/upgrades/01..05`, `src/domain/behavior/`, `src/game/presentation/`, cambios en `GameScene.ts` y `labLevel.ts`). Se conservan sin modificaciones.
Línea base: `git status --short` → árbol limpio · `npm run validate` sobre `e87d755` → exit 0, 10 archivos / 55 tests, build OK (sólo la advertencia preexistente de tamaño de chunk de Phaser). Sin fallos previos.

## Exploración mínima
| Capa | Ruta/símbolo | Capacidad comprobada |
|---|---|---|
| Búsqueda | `src/domain/navigation/search.ts` · `findPathBfs`, `findPathAStar`, `SearchResult` | BFS con cola FIFO y A* con Manhattan; ambos informan `status`, `path`, `totalCost`, `expandedNodes`, `maximumFrontier`, `explored`. A* sumaba costo fijo 1 y `totalCost = path.length - 1`. |
| Seguimiento | `src/domain/navigation/pathFollower.ts` · `advanceAlongPath` | Consume puntos de paso con distancia máxima por actualización. No interviene en el costo y no se modificó. |
| Consumidor | `src/application/simulation/navigationDemo.ts` · `calculateRoute` ← `src/game/scenes/GameScene.ts` · `renderNavigation` | Selecciona algoritmo y devuelve `SearchResult`; GameScene lo usa para el clic manual y la patrulla. |
| Pruebas | `tests/navigation/search.test.ts`, `tests/navigation/pathFollower.test.ts`, `tests/application/` | Casos de éxito, inicio=meta, extremos inválidos e inaccesible sobre mapas propios (no sobre el fixture 5x3). |

Contraste y decisión humana: se comprobó en `search.ts` que `totalCost` se calculaba como `path.length - 1`; por lo tanto, cambiar sólo la prioridad de A* habría dejado un costo que cuenta pasos (el rodeo mostraría 6 por coincidencia y la ruta directa nunca mostraría 16). **Decisión:** pasar el costo de entrada como parámetro opcional de A* y hacer que `totalCost` sea el `g` real, dejando BFS con su contrato unitario. El consumidor elegido es `calculateRoute`, que ya existía y es el punto por el que pasa todo el juego; se configura con `options.terrainCost` en lugar de crear una función o interfaz nueva. También se decidió rechazar costos < 1 para no invalidar Manhattan.
Spec/plan aprobados: después de la exploración y la línea base (paso 3/5), antes del commit `2cdfde8`. Ajuste respecto de la plantilla: se agregó a la spec la sección "Adaptación al contrato real".

## Comparación común — fixture libre 5x3
Vecinos y desempate reales: cuatro vecinos en orden norte, este, sur, oeste (`CARDINAL_DIRECTIONS` en `gridGraph.ts`). A* elige menor `f = g + h`; ante empate, menor `h`; ante empate, menor orden de inserción (`lowestPriorityNode`). Fuente: `tests/navigation/practicaFixture.test.ts` (salida `[fixture]` de `npx vitest run tests/navigation/practicaFixture.test.ts --reporter=verbose`).

| Algoritmo | Estado | Ruta | Pasos | Costo | Expandidos | Frontera máxima |
|---|---|---|---:|---:|---|---|
| BFS | success | (0,1)-(1,1)-(2,1)-(3,1)-(4,1) | 4 | 4 | 12 | 4 |
| A* | success | (0,1)-(1,1)-(2,1)-(3,1)-(4,1) | 4 | 4 | 5 | 9 |

Lectura: ambos encuentran la ruta directa de costo mínimo. A* expande menos nodos (5 contra 12) porque Manhattan la orienta hacia la meta, pero su frontera máxima es mayor en esta implementación: A* conserva en la frontera todos los vecinos descubiertos mientras avanza en línea recta. Es una ejecución sobre un mapa chico; no demuestra que A* sea siempre más rápido.

DFS (traza conceptual, no ejecutada): con pila y vecinos insertados en orden inverso, DFS sigue la primera rama hasta el fondo y encuentra S,A,C,X,G (4 pasos), mientras BFS encuentra S,B,D,G (3 pasos). Encontrar primero una meta sólo prueba que existe un camino por esa rama, no que sea el más corto: las ramas no exploradas pueden contener uno mejor.

Dijkstra (traza conceptual completada): extraer S=0 → descubrir A=1, B=3. Extraer A=1 → descubrir G=10. Extraer B=3 → mejorar G=6. Extraer la entrada válida de G → ruta S-B-G, costo 6. No se termina al descubrir G por primera vez (costo 10) porque todavía había en la frontera un estado de costo menor (B=3) que podía llevar a una ruta mejor; sólo la **extracción** de G garantiza el mínimo con pesos no negativos. Conclusión pasos frente a costo: ambas rutas tienen 2 acciones, así que BFS no puede distinguirlas; Dijkstra y A* ponderado minimizan costo.

## Resultados del Anexo A
Salida de `npx vitest run tests/navigation/slowTerrain.test.ts --reporter=verbose`:
```
[anexoA] A* franja {"status":"success","path":"(0,1)-(0,0)-(1,0)-(2,0)-(3,0)-(4,0)-(4,1)","steps":6,"totalCost":6,"expandedNodes":7,"maximumFrontier":5}
```
| Ruta | Pasos | Costo |
|---|---:|---:|
| Directa (0,1)-(1,1)-(2,1)-(3,1)-(4,1) con franja | 4 | 16 (=5+5+5+1) |
| Rodeo superior de A* ponderado | 6 | 6 |
| BFS con franja (no ve costos) | 4 | 16 ponderado; informa 4 (contrato unitario) |
| A* con franja restaurada a costo 1 | 4 | 4 |

## Criterio → evidencia
| Criterio | Prueba/archivo y comando o reproducción | Observado | Cumple/pendiente |
|---|---|---|---|
| BASE-AC1 | Este documento (encabezado, exploración); `git rev-parse HEAD`, `git status --short`, `npm run validate` sobre `e87d755` | Commit inicial, capas, cambios previos y línea base 55/55 registrados; supuestos separados de lo comprobado | Cumple |
| BASE-AC2 | `tests/navigation/practicaFixture.test.ts` › "BASE-AC2: mapa libre…" (BFS y A*) | Ambos: success, ruta cardinal, 4 pasos, costo 4; métricas en la tabla; trazas DFS/Dijkstra con conclusión | Cumple |
| BASE-AC3 | `practicaFixture.test.ts` › inicio=meta, barrera x=2, extremos (-1,1) y (5,1) | inicio=meta: `success`, `path=[S]`, costo 0 · barrera: `unreachable`, `path=[]`, `totalCost=null` · extremos: `invalid-start` / `invalid-goal`, 0 expandidos. Éxito inmóvil y fracaso son distinguibles por `status` | Cumple |
| BASE-AC4 | `spec.md` (Aprobada), `plan.md` (Aprobado), commit `a61089a` anterior a `2cdfde8`; contraste y decisión arriba | Sólo se desarrolló el Anexo A | Cumple |
| A-AC1 | `tests/navigation/slowTerrain.test.ts` › "ruta directa cuesta 16" y "A* ponderado devuelve un rodeo…" | Directa: 4 pasos, costo 16. A*: 6 pasos, `totalCost` 6, igual a la suma de costos de la ruta, cardinal, sin entrar en la franja (rodeo superior; el test acepta arriba o abajo) | Cumple |
| A-AC2 | `slowTerrain.test.ts` › "sin franja lenta…" y "copia los datos…" | Con franja a costo 1 y con costo por defecto: 4 pasos, costo 4; una función creada antes no arrastra cambios posteriores (A-04) | Cumple |
| A-AC3 | `tests/application/navigationDemo.test.ts` (consumidor real `calculateRoute`) | `calculateRoute(..., "astar", { terrainCost })` → costo 6 y 6 pasos; sin opciones → 4/4; BFS con opciones → 4 (unitario); rutas de `PATROL_POINTS` en `LAB_MAP` sin cambios (costo = pasos) | Cumple |
| BASE-AC5 | `npm run validate` final; `git diff --stat e87d755 6eec4c5` | exit 0 · 13 archivos / 74 tests · build OK. Diff: 8 archivos (2 de código modificados, 1 de código nuevo, 3 de pruebas nuevos, spec y plan). Sin cambios en `GameScene.ts`, `pathFollower.ts`, percepción, `src/domain/behavior/` ni `package.json` | Cumple |
| BASE-AC6 | `docs/practica-navegacion/` + URL + commit informado en la plataforma | Los tres documentos, el código y las pruebas están en el mismo commit final entregado | Cumple (al registrar la entrega) |

## Registro mínimo de intervención
Prompts: pasos 1 a 8 de la guía con el prompt orientativo A. Cambio relevante respecto del prompt: además de pedir que A* sume costos, se exigió que `totalCost` deje de calcularse con la cantidad de puntos.
Decisión tras incremento 1: **aceptar.** Los 7 tests de `slowTerrain.test.ts` y los tests previos de `tests/navigation/` (30 en total) pasan; `typecheck` sin errores. Se verificó en el diff que BFS sigue usando `path.length - 1` y que el valor por defecto de A* es costo 1.
Decisión tras incremento 2: **aceptar.** El consumidor existente recibe la configuración sin cambiar su firma para las llamadas actuales; GameScene no necesitó cambios. Se agregó una prueba de regresión sobre los puntos de patrulla del nivel real.
Validación final: `npm run validate` → exit 0 · Test Files 13 passed · Tests 74 passed · build OK (advertencia de tamaño de chunk preexistente).
Diff revisado: `src/domain/navigation/search.ts`, `src/domain/navigation/terrainCost.ts` (nuevo), `src/application/simulation/navigationDemo.ts`, `tests/navigation/practicaFixture.test.ts`, `tests/navigation/slowTerrain.test.ts`, `tests/application/navigationDemo.test.ts`, `docs/practica-navegacion/*`. Alcance acotado a navegación, su consumidor y pruebas.
Conclusión: cuando el recorrido tiene costos distintos por celda, la navegación conveniente es A* ponderado, porque minimiza el costo acumulado y no sólo la cantidad de pasos. BFS sigue siendo útil como referencia unitaria, pero en este fixture devuelve la ruta directa de costo 16 y no puede ver que el rodeo cuesta 6. Manhattan sigue siendo válida porque se exige un costo mínimo de 1 por celda. Para el guardia, el costo 5 representa una preferencia de diseño (por ejemplo, barro), no una velocidad física.
Limitaciones: el juego todavía no configura ninguna franja lenta en `LAB_MAP` (fuera de alcance: no se editan niveles ni velocidades), así que el modo ponderado se demuestra con pruebas del consumidor y no visualmente. BFS ignora `terrainCost` por contrato. `lowestPriorityNode` recorre toda la frontera en cada extracción (O(n)); es adecuado para estos mapas, pero no para mapas grandes.
