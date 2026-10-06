# Plan — Escape de último momento

Spec: `spec.md` (revisada antes de autorizar código).

| # | Incremento | Archivos | Validación | Riesgo | Detenerse si |
|---|---|---|---|---|---|
| 1 | Evento `escape` en dominio + tests | `src/domain/behavior/alert.ts`, `tests/behavior/alert.test.ts` | `npx vitest run tests/behavior/alert.test.ts` | Falsos positivos al parpadear visibilidad | Se necesita info que el guardia no percibe |
| 2 | Feedback en escena | `src/game/presentation/feedback.ts`, `src/game/scenes/GameScene.ts` | `npm run validate` + ejecución | Superposición con flash de alerta | — |

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
