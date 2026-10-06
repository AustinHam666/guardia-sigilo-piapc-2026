# Evidencia — Impacto visual extremo de alerta

## Versiones
- Inicial: `d4de93e` (Initial commit del repo individual, creado desde la plantilla piapc-guardia-sigilo `ae98e1a`; árbol limpio).
- Final: commit que agrega esta evidencia (ver historial de `main`; código del upgrade sin cambios desde `b766f7a`).
- Entorno: Node v22.22.0, npm 10.8.2, Linux. Herramienta/modelo: Claude (Claude Opus 5.5) como agente, conducido y revisado por el estudiante. Ejecución y validación repetidas en Windows, Node v24.20.0.

## Validación de referencia (antes de cambiar)
`npm run validate` → exit 0 · 6 archivos de prueba / 39 tests · build OK (sólo advertencia de tamaño de chunk de Phaser, preexistente).

## Comandos y resultados
```bash
npm run typecheck          # tsc --noEmit
npx vitest run tests/behavior/alert.test.ts tests/presentation/feedback.test.ts
npm run validate           # typecheck + suite completa + build
```
- `npx vitest run tests/behavior/alert.test.ts tests/presentation/feedback.test.ts` → exit 0, todos pasan.
- `npm run validate` final → exit 0 · **10 archivos / 55 tests** · build OK.

## Registro breve
1. Exploración en lectura: `AGENTS.md`, `docs/arquitectura.md`, `GameScene.ts`, `perceptionSimulation.ts`, `memory.ts`, `pathFollower.ts`.
2. Contraste con el repo: (a) `src/domain/behavior/` no existía aunque la arquitectura lo prevé → se crea ahí; (b) `drawPerception` sólo usaba `vision.visible` para el color (confirmado en el código H3).
3. Spec redactada y revisada → plan aprobado → incrementos según `plan.md`, validando tras cada uno.
4. Decisión humana: el disparador es el evento de dominio (flanco), nunca el estado, para garantizar un shake único. Es el ejemplo de la consigna aplicado literalmente.

## Diff (cambios autorizados)
Ver `git show [HASH]`. Archivos tocados por este upgrade: los listados en `plan.md`. No se modificaron `src/domain/perception/`, `src/domain/navigation/` ni dependencias (`package.json` sin cambios).

## Matriz criterio → evidencia
| Criterio | Comprobación | Resultado |
|---|---|---|
| CA1 Evento único por entrada a alerta | test `goes calma -> sospecha -> alerta and emits alerta-iniciada exactly once` | ✅ PASA (ver salida) |
| CA2 Duración < 1 s | test `keeps the alert impact under one second` | ✅ PASA (ver salida) |
| CA3 Restauración de cámara | log de fin con `scroll=(0,0)` en ejecución | ✅ PASA — `finalizado scroll=(0,0)` a los 350 ms |
| CA4 No repetición en alerta sostenida | mismo test CA1 (40 frames, 1 evento) + log en ejecución | ✅ PASA — un único `shake+flash iniciado` entre 273313 y 276963 ms |

## Reproducción visual / telemetría
Reproducción: `npm run dev` → `http://localhost:5173` → consola (F12). Validación local en Windows: `npm run validate` → 10 archivos / 55 tests, build OK (`docs/upgrades/validate-windows.log`).

```
[telemetria] t=273313ms alerta estado=alerta nivel=1.00
[telemetria] t=273313ms impacto alerta: shake+flash iniciado
[telemetria] t=273663ms impacto alerta: finalizado scroll=(0,0)
```
- **Activación:** en el mismo instante en que el estado pasa a ALERTA (273313 ms).
- **Finalización:** 350 ms después (273663 ms), < 1 s.
- **Estado posterior:** cámara restaurada, `scroll=(0,0)`.
- **No repetición:** un solo `shake+flash iniciado` durante toda la permanencia en alerta (273313→276963 ms).

![captura](captura-alerta-logs.png)

## Revisión final
- Limitaciones: ver decisión arriba; parámetros calibrados a ojo.
- Riesgos: dependencia entre upgrades 02/04/05 y el medidor 03.
- **Decisión humana:** **Integrar.** Shake único, < 1 s, cámara restaurada.
