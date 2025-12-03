# Walkthrough: Actualización del Chat Flotante Ivo-t

He actualizado el chat flotante de Ivo-t para que sea completamente funcional, eliminando el modo "demo" y conectándolo a la API real.

## Archivos Modificados
- `apps/web/src/services/ivoChatService.ts`: Nuevo servicio compartido para centralizar la comunicación con la API de Ivo-t.
- `apps/web/src/pages/IvoT.tsx`: Refactorizado para usar el nuevo servicio compartido (sin cambios visuales ni funcionales para el usuario).
- `apps/web/src/components/IvoTFab.tsx`:
  - **Conexión Real**: Ahora usa `IvoChatService` para enviar y recibir mensajes reales de la IA.
  - **Tamaño Aumentado**: El panel ahora es más grande (~420px x 600px en desktop) para una mejor lectura.
  - **Limpieza**: Se eliminaron los mensajes de "demo visual" y el footer con disclaimers.
  - **UX**: Se agregó un indicador de "Ivo-t está escribiendo..." mientras se espera la respuesta.

## Verificación
- **Chat Flotante**:
  - Al abrirlo, el panel es visiblemente más grande.
  - Al enviar un mensaje, se recibe una respuesta real de la IA (no el mensaje fijo de demo).
  - No aparecen textos de "demo" ni enlaces a la vista completa en el footer.
- **Página Ivo-t (Sidebar)**:
  - Sigue funcionando exactamente igual, pero ahora usa el servicio compartido internamente.
