# Spec — Impacto visual extremo de alerta

**Proyecto:** Guardia de Sigilo (Phaser 3.90 + TypeScript 5.9, Vite 6, Vitest 4)
**Commit base:** `d4de93e` · **Rama:** `main`

## Problema
Cuando el guardia alcanza la alerta máxima no hay ningún golpe de feedback: el momento de detección pasa desapercibido.

## Intención de diseño
Que la detección resulte clara e inconfundible.

## Objetivo / resultado esperado
Al entrar en estado ALERTA (evento de dominio `alerta-iniciada`) la cámara hace un shake único de 350 ms (intensidad 0,012) y un flash rojo de 250 ms; termina y la cámara vuelve a su posición normal en menos de 1 s. No se repite mientras se siga en alerta; vuelve a dispararse sólo tras salir y reentrar.

## Alcance
- Evento `alerta-iniciada` (dominio, upgrade 03) y constantes `ALERT_IMPACT` en `feedback.ts`.
- `GameScene.applyAlertEvents`: `cameras.main.shake` + `flash` + telemetría de inicio y fin.

## Fuera de alcance
- Cambiar detección, navegación o controles para producir el efecto.
- Partículas o sonido.

## Restricciones
- `src/domain/` no importa Phaser, DOM ni APIs del navegador (AGENTS.md).
- `src/game/` sólo presenta; no decide reglas de comportamiento.
- Sin dependencias nuevas, sin red, sin publicar ni hacer commits sin autorización.
- No modificar detección (`evaluateVision`, `evaluateSound`), memoria ni búsqueda (`search.ts`).

## Caso normal
Jugador visto hasta llenar la barra: shake + flash una vez; log `impacto alerta: shake+flash iniciado` y ~350 ms después `impacto alerta: finalizado scroll=(0,0)`.

## Caso límite
Permanecer en alerta muchos frames no repite el shake (el evento se emite una sola vez); tras bajar a sospecha y volver a 1 se dispara de nuevo.

## Criterios de aceptación y evidencia prevista
- **CA1 Evento único por entrada a alerta** — prueba prevista: test `goes calma -> sospecha -> alerta and emits alerta-iniciada exactly once`
- **CA2 Duración < 1 s** — prueba prevista: test `keeps the alert impact under one second`
- **CA3 Restauración de cámara** — prueba prevista: log de fin con `scroll=(0,0)` en ejecución
- **CA4 No repetición en alerta sostenida** — prueba prevista: mismo test CA1 (40 frames, 1 evento) + log en ejecución
