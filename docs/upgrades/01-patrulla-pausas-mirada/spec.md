# Spec — Patrulla con pausas y mirada direccional

**Proyecto:** Guardia de Sigilo (Phaser 3.90 + TypeScript 5.9, Vite 6, Vitest 4)
**Commit base:** `d4de93e` · **Rama:** `main`

## Problema
En H3 el guardia sólo sigue una ruta indicada con clic y queda inmóvil mirando hacia el último tramo. No hay ritmo de recorrido ni anticipación visual: el jugador no puede leer cuándo el guardia va a moverse ni hacia dónde mira.

## Intención de diseño
Que el jugador pueda anticipar el recorrido del guardia y elegir el momento para cruzar.

## Objetivo / resultado esperado
El guardia recorre cíclicamente 3 puntos de patrulla; al llegar a cada uno se detiene 1,5 s y barre la mirada ±60° alrededor de la dirección de llegada; al terminar la pausa mira de nuevo hacia la dirección de llegada y parte al siguiente punto.

## Alcance
- Módulo de dominio puro `src/domain/behavior/patrol.ts` (`initialPatrolState`, `beginPause`, `tickPause`, `nextPatrolIndex`).
- Datos de nivel `PATROL_POINTS` en `src/application/simulation/labLevel.ts`.
- Integración en `GameScene.updateGuardMovement` y tecla `P` para activar/desactivar patrulla; un clic pasa a modo manual (conserva la demo H3).

## Fuera de alcance
- Persecución, búsqueda o investigación (H4.2–H4.5).
- Cambiar BFS/A* o `advanceAlongPath`.
- Puntos de patrulla aleatorios o editables.

## Restricciones
- `src/domain/` no importa Phaser, DOM ni APIs del navegador (AGENTS.md).
- `src/game/` sólo presenta; no decide reglas de comportamiento.
- Sin dependencias nuevas, sin red, sin publicar ni hacer commits sin autorización.
- No modificar detección (`evaluateVision`, `evaluateSound`), memoria ni búsqueda (`search.ts`).

## Caso normal
Al iniciar la escena el guardia va de (27,17) a (27,4), pausa 1,5 s barriendo la mirada, sigue a (21,8), pausa, vuelve a (27,17) y repite.

## Caso límite
Un `delta` enorme (pestaña en segundo plano) termina la pausa exactamente una vez, sin saltear puntos; con un solo punto el índice vuelve a 0.

## Criterios de aceptación y evidencia prevista
- **CA1 Los puntos se recorren en ciclo** — prueba prevista: `nextPatrolIndex` cicla; test `cycles patrol points`
- **CA2 Durante la pausa la mirada barre ±sweep** — prueba prevista: test `sweeps the gaze during a pause...` (π/4 a 250 ms y −π/4 a 750 ms)
- **CA3 Al terminar mira hacia la llegada y avanza de punto** — prueba prevista: test `ends the pause facing the arrival direction...`
- **CA4 Delta grande termina la pausa una sola vez** — prueba prevista: test `edge case: a single huge delta...`
- **CA5 Todos los tramos de patrulla son alcanzables** — prueba prevista: test `every consecutive patrol leg is reachable with A*`
- **CA6 Observable en ejecución** — prueba prevista: telemetría `patrulla pausa en punto N` / `patrulla fin pausa -> punto N` en consola + HUD `patrulla PAUSA/MOVIENDO`
