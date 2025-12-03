# Actualización de Historial y Agenda Ivo-t

Esta actualización mejora la integración entre Ivo-t y la Agenda, y añade persistencia del historial de chat.

## 1. Agenda: Eventos Internos y Sincronización

### Lógica de Creación
Cuando Ivo-t agenda un evento (`POST /api/agenda/ivot/schedule`):
1.  **Siempre** se crea el evento en la **Agenda Interna** de Inmovia (`agenda.json`).
2.  **Opcionalmente**, si la cuenta de Google del usuario está conectada (`status.connected === true`), se intenta sincronizar el evento con Google Calendar.
    *   Si la sincronización falla (ej. token expirado), el error se loguea pero **no bloquea** la creación del evento interno.

### Visualización en Agenda
La pantalla de Agenda (`Agenda.tsx`) ahora:
1.  Carga eventos de Google Calendar (si es posible).
2.  Carga eventos de la Agenda Interna.
3.  **Fusiona** ambas listas para mostrar todos los eventos en el calendario y la lista de próximos eventos.
    *   Esto garantiza que los eventos creados por Ivo-t sean visibles incluso si Google Calendar no está conectado.

## 2. Historial de Chat Persistente

Ivo-t ahora recuerda las conversaciones por usuario.

### Almacenamiento
*   Se utiliza `localStorage` para guardar el historial.
*   Las claves son únicas por usuario y contexto: `ivot_history_{userId}_{context}`.
*   Se guardan los últimos 50 mensajes.

### Contextos Separados
Se mantienen dos historiales independientes para evitar confusiones:
1.  **Panel Principal (`IvoT.tsx`)**: Contexto `"panel"`.
2.  **Chat Flotante (`IvoTFab.tsx`)**: Contexto `"fab"`.

### Flujo
1.  Al iniciar sesión, se carga el historial correspondiente al usuario.
2.  Cada nuevo mensaje (del usuario o de Ivo-t) se guarda automáticamente.
3.  Si se cambia de usuario, el historial se limpia y se carga el del nuevo usuario.

## Limitaciones
*   El historial es **local** en el navegador (no se sincroniza entre dispositivos por ahora).
*   La sincronización con Google Calendar es unidireccional para eventos creados desde Ivo-t (Ivo-t -> Google).

## QA
1.  **Prueba sin Google**: Desconectar Google Calendar. Pedir a Ivo-t agendar una reunión. Verificar que aparece en la Agenda.
2.  **Prueba con Google**: Conectar Google Calendar. Pedir a Ivo-t agendar. Verificar que aparece en Agenda y en Google.
3.  **Historial**: Refrescar la página y verificar que los mensajes de Ivo-t siguen ahí.
