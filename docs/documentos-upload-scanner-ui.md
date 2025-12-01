# Documentación: UI de Subida y Escáner

## 1. UploadDocumentModal.tsx

Se ha refactorizado el modal de subida para alinearse con el diseño visual del resto de la aplicación (estilo "Inmovia").

### Cambios Visuales
*   **Overlay**: Se usa la clase `.modal-overlay` con fondo semitransparente.
*   **Contenedor**: Estilo `.modal-content` con bordes redondeados y padding consistente.
*   **Inputs**: Se aplican clases `.form-control` y `.form-label` para uniformidad.
*   **Botones**: Se usan `.btn-primary` y `.btn-secondary` en el footer.

### Funcionalidad
*   Permite seleccionar archivo, título, categoría, propiedad y cliente.
*   Muestra estado "Subiendo..." y deshabilita acciones durante la carga.

## 2. ScannerModal.tsx

Se ha añadido la funcionalidad de captura directa desde cámara, especialmente útil para dispositivos móviles, y se ha corregido el refresco de la vista.

### Nueva Funcionalidad
*   **Botón "📷 Tomar foto (Móvil)"**:
    *   Utiliza un input oculto con `capture="environment"`.
    *   En móviles, abre directamente la cámara trasera.
    *   En desktop, abre el selector de archivos.
*   **Botón "📷 Usar Cámara (Web)"**:
    *   Mantiene la funcionalidad previa de `getUserMedia` para webcams en desktop.
*   **Refresco Automático**:
    *   Al agregar una nueva página (ya sea por archivo o cámara), el visor salta automáticamente a la última página agregada.
    *   Se asegura que la vista previa se actualice inmediatamente.

### Flujo de Prueba
1.  Abrir "Documentos" -> "Escanear".
2.  Verificar que aparecen ambos botones de cámara.
3.  Probar "Tomar foto (Móvil)" (en desktop abrirá selector).
4.  Seleccionar una imagen y verificar que se agrega como nueva página al escáner.
5.  **Verificar que la nueva imagen se muestra automáticamente en el visor central.**
6.  Verificar que se pueden seguir agregando más páginas sin perder las anteriores.
