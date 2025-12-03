# Walkthrough: Mejoras de UX en Chat Flotante

He implementado mejoras de usabilidad en el chat flotante de Ivo-t para que la experiencia sea más fluida.

## Archivos Modificados
- `apps/web/src/components/IvoTFab.tsx`:
  - **Auto-scroll**: Se añadió un `messagesEndRef` y un `useEffect` para que el chat baje automáticamente al último mensaje cada vez que se envía o recibe uno.
  - **Foco Automático**: Se implementó un `inputRef` para mantener el foco en el campo de texto después de enviar un mensaje y al abrir el chat, evitando que el usuario tenga que volver a hacer clic.

## Verificación
- **Scroll**: Al enviar un mensaje o recibir respuesta, el chat debe desplazarse solo hasta el final.
- **Foco**: Al presionar "Enviar" o Enter, el cursor debe permanecer en el input listo para escribir de nuevo.
