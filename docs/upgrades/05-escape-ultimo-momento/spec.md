# Spec — Escape de último momento

**Proyecto:** Guardia de Sigilo (Phaser 3.90 + TypeScript 5.9, Vite 6, Vitest 4)
**Commit base:** `d4de93e` · **Rama:** `main`

## Problema
Si el jugador estuvo a punto de ser detectado y logra cortar la línea de visión, el juego no lo reconoce; la maniobra ajustada no genera alivio.

## Intención de diseño
Recompensar con alivio una maniobra ajustada.

## Objetivo / resultado esperado
Si durante una exposición el medidor superó 0,75 sin llegar a alerta y el jugador sale de la visión válida, el dominio emite `escape`; la escena muestra "ESCAPE" en verde 900 ms y un flash verde de 300 ms.

## Alcance
- Detección del evento en `updateAlert` (`peakWhileVisible`, `escapeThreshold`).
- Feedback `ESCAPE_FEEDBACK` + etiqueta en `GameScene`.

## Fuera de alcance
- Puntuación o recompensas persistentes.
- Escape tras alerta completa (eso no es "último momento").

## Restricciones
- `src/domain/` no importa Phaser, DOM ni APIs del navegador (AGENTS.md).
- `src/game/` sólo presenta; no decide reglas de comportamiento.
- Sin dependencias nuevas, sin red, sin publicar ni hacer commits sin autorización.
- No modificar detección (`evaluateVision`, `evaluateSound`), memoria ni búsqueda (`search.ts`).

## Caso normal
Jugador cerca del guardia, barra ~80 %, se esconde tras una pared: aparece ESCAPE y log `escape de ultimo momento pico=0.8x`.

## Caso límite
Exposición breve (pico <0,75) o escape después de haber llegado a ALERTA: no se emite `escape`.

## Criterios de aceptación y evidencia prevista
- **CA1 Escape tras casi-detección** — prueba prevista: test `emits escape when vision is lost after a near miss`
- **CA2 Sin escape en exposición breve ni tras alerta** — prueba prevista: test `edge case: no escape for a short exposure or after full alert`
- **CA3 Feedback termina** — prueba prevista: log `escape: feedback finalizado` ~900 ms después
