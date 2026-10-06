# Spec — Medidor de alerta y estados del nivel

**Proyecto:** Guardia de Sigilo (Phaser 3.90 + TypeScript 5.9, Vite 6, Vitest 4)
**Commit base:** `d4de93e` · **Rama:** `main`

## Problema
En H3 la detección es binaria e instantánea: ver al jugador un frame equivale a verlo diez segundos. No hay consecuencia visible gradual del peligro.

## Intención de diseño
Que el peligro se acumule y se vea, dando margen de reacción.

## Objetivo / resultado esperado
Un nivel 0..1 sube mientras hay visión válida (más rápido cuanto más cerca) y baja al perderla. Estados: calma → sospecha (≥0,30) → alerta (=1). Histéresis: alerta sólo vuelve a sospecha con nivel ≤0,50; sospecha vuelve a calma con ≤0,15. El HUD muestra barra y estado; cada cambio genera telemetría.

## Alcance
- Dominio puro `src/domain/behavior/alert.ts` (`updateAlert`, `initialAlertState`, `DEFAULT_ALERT_CONFIG`).
- HUD `alertMeterLabel` en `feedback.ts`; integración en `GameScene.updatePerception`.

## Fuera de alcance
- Que la alerta cambie la conducta del guardia (persecución = H4.3).
- Derrota/game over.

## Restricciones
- `src/domain/` no importa Phaser, DOM ni APIs del navegador (AGENTS.md).
- `src/game/` sólo presenta; no decide reglas de comportamiento.
- Sin dependencias nuevas, sin red, sin publicar ni hacer commits sin autorización.
- No modificar detección (`evaluateVision`, `evaluateSound`), memoria ni búsqueda (`search.ts`).

## Caso normal
El jugador se queda a 50 px en el cono: la barra se llena en ~0,7 s, pasa por SOSPECHA y llega a ALERTA.

## Caso límite
Alternar visible/oculto alrededor del umbral no hace parpadear el estado (histéresis); delta 0 no cambia nada; rango ≤0 se rechaza.

## Criterios de aceptación y evidencia prevista
- **CA1 Sube visible, baja oculto** — prueba prevista: test `rises while the player is visible and falls when hidden`
- **CA2 Proximidad acelera** — prueba prevista: test `rises faster when the player is closer`
- **CA3 calma→sospecha→alerta con 2 cambios y 1 inicio** — prueba prevista: test `goes calma -> sospecha -> alerta...`
- **CA4 Histéresis de salida** — prueba prevista: test `uses hysteresis...`
- **CA5 Entradas inválidas rechazadas** — prueba prevista: test `rejects invalid input`
- **CA6 Observable** — prueba prevista: HUD `alerta [#####.....] SOSPECHA` + log `[telemetria] alerta estado=...`
