# Documentación: Refactorización del Escáner

## Resumen
Se ha unificado la lógica del escáner en un único componente `ScannerModal.tsx`, eliminando la duplicidad con `ScannerModalModern.tsx` y asegurando una experiencia de usuario consistente y moderna.

## Cambios Realizados

### 1. Unificación de Componentes
*   **Scanner Oficial**: `ScannerModal.tsx` es ahora el único componente de escáner.
*   **UI Moderna**: Se migró la interfaz visual de `ScannerModalModern.tsx` (estilo oscuro, sidebar lateral, canvas centrado) a `ScannerModal.tsx`.
*   **Limpieza**: Se eliminó `ScannerModalModern.tsx` y su importación en `Documentos.tsx`.

### 2. Funcionalidad de Cámara
*   **Botones Visibles**: Se agregaron botones explícitos en el header del escáner:
    *   `📷 Web`: Abre la cámara web (desktop/laptop) con overlay de captura en tiempo real.
    *   `📱 Foto`: Abre la cámara nativa en móviles (o selector de archivos en desktop) mediante input `capture="environment"`.
*   **Overlay de Cámara**: Se integró el visor de cámara web dentro del modal, permitiendo capturar múltiples fotos sin salir del flujo.

### 3. Corrección de Refresco (Auto-focus)
*   **Problema Anterior**: Al agregar una nueva página, el visor se quedaba en la página anterior.
*   **Solución**: Se actualizó la lógica en `addFiles` y `capturePhoto` para que, al agregar una nueva página, el índice `idx` se actualice automáticamente a la última posición (`arr.length - 1`).
*   **Resultado**: El usuario ve inmediatamente la foto que acaba de tomar o subir.

### 4. Integración en Documentos
*   `Documentos.tsx` ahora renderiza incondicionalmente `<ScannerModal />`.
*   Se eliminó el estado `useLegacyScanner` y el toggle asociado.

## Pruebas Realizadas (Simuladas)
1.  **Apertura**: El escáner abre con el diseño moderno.
2.  **Cámara Web**: El botón abre el video, permite capturar, y la foto aparece como nueva página activa.
3.  **Cámara Móvil**: El botón dispara el input de archivo correcto.
4.  **Subida de Archivos**: "Agregar pág." funciona y hace foco en la nueva imagen.
5.  **Edición**: Recorte, filtros (sombras, contraste, binarización) y rotación funcionan sobre la página activa.
6.  **Exportación**: JPG y PDF generan los archivos correctamente.

### 5. Actualización UI Header (Última iteración)
*   **Limpieza**: Se simplificó el header a dos acciones principales:
    *   `+ Subir archivos`: Permite selección múltiple de imágenes y PDFs.
    *   `📷 Cámara`: Botón inteligente que detecta si es dispositivo móvil o desktop.
        *   **Móvil**: Abre la cámara nativa directamente.
        *   **Desktop**: Abre el visor de webcam integrado.
*   **Estilo**: Se aplicó un diseño más limpio y consistente con el resto de la aplicación.
