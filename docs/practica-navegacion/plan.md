# Plan — práctica de navegación
Estado: Aprobado
Variante: A — terreno lento
Spec: spec.md

| Incremento | Trabajo | Archivos reales | Criterios | Comprobación |
|---|---|---|---|---|
| 1 | Costo de entrada en A* (`enterCost` opcional, `totalCost` = g real) y función `createTerrainCost`; probar franja (normal), restauración y límites | `src/domain/navigation/terrainCost.ts` (nuevo), `src/domain/navigation/search.ts`, `tests/navigation/slowTerrain.test.ts` (nuevo) | A-AC1, A-AC2, A-01, A-02, A-04 | `npm run typecheck` · `npx vitest run tests/navigation` |
| 2 | Conectar con el consumidor existente `calculateRoute` mediante `options.terrainCost`; probar modo ponderado, modo unitario sin opciones, BFS sin cambios y rutas actuales del nivel | `src/application/simulation/navigationDemo.ts`, `tests/application/navigationDemo.test.ts` (nuevo) | A-AC3, A-03, BASE-AC5 | `npx vitest run tests/application/navigationDemo.test.ts` |
| 3 | Validación final, revisión de diff y cierre de evidencia | `docs/practica-navegacion/evidencia.md` | BASE-AC1 a BASE-AC6 | `npm run validate` · `git diff --stat e87d755` |

Referencia previa: comparación y casos comunes BASE-01 a BASE-04 completados con
`tests/navigation/practicaFixture.test.ts` (sólo pruebas, sin tocar implementación).

Riesgos:
- Que `totalCost` siga contando pasos aunque cambie la prioridad (se detecta comparando
  la ruta directa 16 contra el rodeo 6, y con `pathCost(path) === totalCost`).
- Romper el contrato unitario existente usado por GameScene y por los tests previos
  (se mitiga con el valor por defecto `unitEnterCost` y la prueba de regresión sobre `PATROL_POINTS`).

Detenerse si: faltan permisos, hay cambios ajenos, conflicto de contrato,
regresión nueva o se requiere dependencia/UI/refactorización fuera del alcance
(por ejemplo, tocar `GameScene.ts`, `pathFollower.ts`, percepción o la FSM).
No crear commits ni publicar automáticamente.
