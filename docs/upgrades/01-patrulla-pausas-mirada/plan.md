# Plan — Patrulla con pausas y mirada direccional

Spec: `spec.md` (revisada antes de autorizar código).

| # | Incremento | Archivos | Validación | Riesgo | Detenerse si |
|---|---|---|---|---|---|
| 1 | Dominio de pausa y barrido | `src/domain/behavior/patrol.ts`, `tests/behavior/patrol.test.ts` | `npx vitest run tests/behavior/patrol.test.ts` | Ángulo mal normalizado | El módulo necesita importar Phaser |
| 2 | Puntos de patrulla del nivel | `src/application/simulation/labLevel.ts`, `tests/application/patrolRoute.test.ts` | test de alcanzabilidad A* | Punto sobre pared | Algún tramo es inalcanzable |
| 3 | Integración en escena + tecla P | `src/game/scenes/GameScene.ts` | `npm run validate` + ejecución | Romper demo de clic H3 | Haría falta cambiar `pathFollower.ts` |

## Validación general
```bash
npm run typecheck          # tsc --noEmit
npx vitest run tests/behavior/patrol.test.ts tests/application/patrolRoute.test.ts
npm run validate           # typecheck + suite completa + build
```

## Condiciones para detenerse
- Un cambio requeriría importar Phaser/DOM en `src/domain/`.
- Aparece un archivo fuera de los previstos en el `git diff`.
- `npm run validate` falla sin causa comprendida.
- Una decisión de diseño no está cubierta por la spec.
