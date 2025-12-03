# Integración Ivo-t ↔ Agenda

Esta integración permite a los usuarios agendar eventos en la Agenda de Inmovia Office conversando naturalmente con Ivo-t.

## Flujo de Usuario

1.  **Solicitud**: El usuario escribe en el chat de Ivo-t algo como:
    *   "Agendame una reunión mañana a las 15hs con Juan."
    *   "Crear evento para visitar propiedad en Banfield el viernes a las 10."

2.  **Clarificación**: Si faltan datos, Ivo-t preguntará:
    *   "¿Cuál es el título del evento?"
    *   "¿Cuánto dura?"
    *   "¿Dónde es?"

3.  **Confirmación**:
    *   Ivo-t muestra un resumen de los datos entendidos.
    *   Aparece un panel de confirmación especial en el chat con los detalles (Título, Fecha, Hora, Invitados).
    *   El usuario puede seleccionar usuarios de Inmovia para invitar (si Ivo-t detectó nombres).

4.  **Agendado**:
    *   Al confirmar, el evento se guarda en la **Agenda Interna** de Inmovia.
    *   Si hubo invitados, reciben una notificación y pueden ver la invitación en su propia Agenda.

## Gestión de Invitaciones

En la sección **Agenda**, los usuarios verán un bloque de "Invitaciones Pendientes" si tienen alguna.
*   **Aceptar**: El evento se confirma en su asistencia.
*   **Rechazar**: Se notifica al organizador.

## Detalles Técnicos

### Backend
*   **Modelo**: `AgendaModel` extendido para soportar `source: 'ivot'`, `participants` y `isShared`.
*   **Rutas**:
    *   `POST /api/agenda/ivot/schedule`: Crea el evento desde Ivo-t.
    *   `GET /api/agenda/invitations`: Lista invitaciones pendientes.
    *   `POST /api/agenda/:id/responder-invitacion`: Acepta/Rechaza.

### Frontend
*   **IvoT.tsx**: Parsea la respuesta de Ivo-t buscando el bloque `<event>...</event>` y muestra el panel de confirmación.
*   **Agenda.tsx**: Ahora carga eventos tanto de Google Calendar (si está conectado) como de la Agenda Interna, y muestra las invitaciones pendientes.

## QA
1.  Abrir Ivo-t y pedir "Agendar reunión de prueba mañana a las 10".
2.  Confirmar en el panel.
3.  Ir a Agenda y verificar que el evento aparece.
4.  (Opcional) Loguearse con otro usuario invitado y aceptar la invitación.
