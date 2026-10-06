# Plan — Impacto visual extremo de alerta

Spec: `spec.md` (revisada antes de autorizar código).

| # | Incremento | Archivos | Validación | Riesgo | Detenerse si |
|---|---|---|---|---|---|
| 1 | Constantes de impacto + test de duración | `src/game/presentation/feedback.ts`, test | `npx vitest run tests/presentation` | — | — |
| 2 | Disparo por evento en escena + telemetría de fin | `src/game/scenes/GameScene.ts` | `npm run validate` + ejecución | Shake permanente si se llama por frame | El disparo requiere estado fuera del dominio de alerta |

## Validación general
```bash
npm run typecheck          # tsc --noEmit
npx vitest run tests/behavior/alert.test.ts tests/presentation/feedback.test.ts
npm run validate           # typecheck + suite completa + build
```

## Condiciones para detenerse
- Un cambio requeriría importar Phaser/DOM en `src/domain/`.
- Aparece un archivo fuera de los previstos en el `git diff`.
- `npm run validate` falla sin causa comprendida.
- Una decisión de diseño no está cubierta por la spec.
