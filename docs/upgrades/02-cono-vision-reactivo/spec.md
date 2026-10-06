# Spec — Cono de visión visible y reactivo

**Proyecto:** Guardia de Sigilo (Phaser 3.90 + TypeScript 5.9, Vite 6, Vitest 4)
**Commit base:** `d4de93e` · **Rama:** `main`

## Problema
En H3 el cono sólo cambia entre azul y verde según `vision.visible`; no comunica cuán cerca está el guardia de alertarse ni distingue sospecha de alerta.

## Intención de diseño
Que el jugador entienda de un vistazo el alcance del guardia y el nivel de amenaza.

## Objetivo / resultado esperado
El color del cono refleja el estado de alerta (calma azul, sospecha amarillo, alerta rojo) y su opacidad sube (0,16 → 0,32) mientras el jugador está dentro de la visión válida. El cono sigue la mirada direccional del upgrade 01.

## Alcance
- Mapeo puro `coneStyle(status, visible)` en `src/game/presentation/feedback.ts` (sin Phaser, testeable).
- Uso en `GameScene.drawPerception`.

## Fuera de alcance
- Cambiar rango, FOV u oclusión (`evaluateVision`).
- Recortar el cono contra paredes (raycast visual): queda como mejora futura.

## Restricciones
- `src/domain/` no importa Phaser, DOM ni APIs del navegador (AGENTS.md).
- `src/game/` sólo presenta; no decide reglas de comportamiento.
- Sin dependencias nuevas, sin red, sin publicar ni hacer commits sin autorización.
- No modificar detección (`evaluateVision`, `evaluateSound`), memoria ni búsqueda (`search.ts`).

## Caso normal
Jugador fuera del cono: cono azul tenue. Entra al cono sin oclusión: se vuelve más opaco; a medida que sube el medidor pasa a amarillo y luego a rojo.

## Caso límite
Jugador detrás de una pared dentro del arco: el cono NO sube de opacidad porque `vision.reason = occluded` (la presentación consume el resultado del dominio, no la geometría).

## Criterios de aceptación y evidencia prevista
- **CA1 Cada estado tiene color distinto** — prueba prevista: test `colours the cone by alert status...`
- **CA2 Opacidad mayor con jugador visible** — prueba prevista: mismo test, comparación de `alpha`
- **CA3 El dominio de visión no cambia** — prueba prevista: `git diff` no toca `src/domain/perception/`
- **CA4 Observable en ejecución** — prueba prevista: captura/clip del cono en los 3 colores + HUD `vision OCLUIDO` en caso límite
