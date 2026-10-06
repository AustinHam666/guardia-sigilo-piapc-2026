# Evidencia — Cono de visión visible y reactivo

## Versiones
- Inicial: `d4de93e` (Initial commit del repo individual, creado desde la plantilla piapc-guardia-sigilo `ae98e1a`; árbol limpio).
- Final: `[HASH DEL COMMIT FINAL]`
- Entorno: Node v22.22.0, npm 10.8.2, Linux. Herramienta/modelo: [OpenCode + modelo usado / Claude Opus 5.5 como asistente].

## Validación de referencia (antes de cambiar)
`npm run validate` → exit 0 · 6 archivos de prueba / 39 tests · build OK (sólo advertencia de tamaño de chunk de Phaser, preexistente).

## Comandos y resultados
```bash
npm run typecheck          # tsc --noEmit
npx vitest run tests/presentation/feedback.test.ts
npm run validate           # typecheck + suite completa + build
```
- `npx vitest run tests/presentation/feedback.test.ts` → exit 0, todos pasan.
- `npm run validate` final → exit 0 · **10 archivos / 55 tests** · build OK.

## Registro breve
1. Exploración en lectura: `AGENTS.md`, `docs/arquitectura.md`, `GameScene.ts`, `perceptionSimulation.ts`, `memory.ts`, `pathFollower.ts`.
2. Contraste con el repo: (a) `src/domain/behavior/` no existía aunque la arquitectura lo prevé → se crea ahí; (b) `drawPerception` sólo usaba `vision.visible` para el color (confirmado en el código H3).
3. Spec redactada y revisada → plan aprobado → incrementos según `plan.md`, validando tras cada uno.
4. Decisión humana: el color depende del estado de alerta (dominio) y no de la distancia directa, para que la presentación no decida reglas. Limitación: el cono se dibuja como arco completo, sin recorte por paredes.

## Diff (cambios autorizados)
Ver `git show [HASH]`. Archivos tocados por este upgrade: los listados en `plan.md`. No se modificaron `src/domain/perception/`, `src/domain/navigation/` ni dependencias (`package.json` sin cambios).

## Matriz criterio → evidencia
| Criterio | Comprobación | Resultado |
|---|---|---|
| CA1 Cada estado tiene color distinto | test `colours the cone by alert status...` | ✅ PASA (ver salida) |
| CA2 Opacidad mayor con jugador visible | mismo test, comparación de `alpha` | ✅ PASA (ver salida) |
| CA3 El dominio de visión no cambia | `git diff` no toca `src/domain/perception/` | ✅ PASA (ver salida) |
| CA4 Observable en ejecución | captura/clip del cono en los 3 colores + HUD `vision OCLUIDO` en caso límite | ⏳ [COMPLETAR tras `npm run dev`: pegar log / ruta de captura] |

## Reproducción visual / telemetría
`npm run dev`, abrir la URL local, consola del navegador (F12). Logs con prefijo `[telemetria]`. Guardar captura o clip en `docs/upgrades/02-cono-vision-reactivo/` y referenciarlo arriba.

## Revisión final
- Limitaciones: ver decisión arriba; parámetros calibrados a ojo.
- Riesgos: dependencia entre upgrades 02/04/05 y el medidor 03.
- **Decisión humana:** [integrar / corregir / revertir / descartar] — [justificación]
