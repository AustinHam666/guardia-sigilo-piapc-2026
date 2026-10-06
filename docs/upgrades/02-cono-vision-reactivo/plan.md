# Plan — Cono de visión visible y reactivo

Spec: `spec.md` (revisada antes de autorizar código).

| # | Incremento | Archivos | Validación | Riesgo | Detenerse si |
|---|---|---|---|---|---|
| 1 | Función `coneStyle` + test | `src/game/presentation/feedback.ts`, `tests/presentation/feedback.test.ts` | `npx vitest run tests/presentation` | Colores poco distinguibles | Requiere lógica de decisión en presentación |
| 2 | Usar `coneStyle` en `drawPerception` | `src/game/scenes/GameScene.ts` | `npm run validate` + ejecución | Depende del estado de alerta (upgrade 08) | Habría que modificar `evaluateVision` |

## Validación general
```bash
npm run typecheck          # tsc --noEmit
npx vitest run tests/presentation/feedback.test.ts
npm run validate           # typecheck + suite completa + build
```

## Condiciones para detenerse
- Un cambio requeriría importar Phaser/DOM en `src/domain/`.
- Aparece un archivo fuera de los previstos en el `git diff`.
- `npm run validate` falla sin causa comprendida.
- Una decisión de diseño no está cubierta por la spec.
