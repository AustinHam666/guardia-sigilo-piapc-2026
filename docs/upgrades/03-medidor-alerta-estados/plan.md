# Plan — Medidor de alerta y estados del nivel

Spec: `spec.md` (revisada antes de autorizar código).

| # | Incremento | Archivos | Validación | Riesgo | Detenerse si |
|---|---|---|---|---|---|
| 1 | Dominio de alerta + tests | `src/domain/behavior/alert.ts`, `tests/behavior/alert.test.ts` | `npx vitest run tests/behavior/alert.test.ts` | Umbrales mal calibrados | Hay que leer memoria/sonido para decidir |
| 2 | HUD y telemetría | `src/game/presentation/feedback.ts`, `src/game/scenes/GameScene.ts` | `npm run validate` + ejecución | HUD ilegible | Cambio en `perceptionSimulation.ts` |

## Validación general
```bash
npm run typecheck          # tsc --noEmit
npx vitest run tests/behavior/alert.test.ts
npm run validate           # typecheck + suite completa + build
```

## Condiciones para detenerse
- Un cambio requeriría importar Phaser/DOM en `src/domain/`.
- Aparece un archivo fuera de los previstos en el `git diff`.
- `npm run validate` falla sin causa comprendida.
- Una decisión de diseño no está cubierta por la spec.
