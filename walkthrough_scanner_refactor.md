# Walkthrough: Refactorización Final del Escáner

## Archivos Modificados
*   `apps/web/src/scanner/components/ScannerModal.tsx`: Reescritura completa para limpiar UI, corregir layout y unificar lógica.
*   (Eliminado) `apps/web/src/scanner/components/ScannerModalModern.tsx`: Se aseguró que no exista.

## Cambios Realizados

### 1. Header Unificado
*   **Botones**: Se redujo el header a dos acciones claras:
    *   `+ Subir archivos`: Botón estilizado que dispara un input oculto (`multiple`, `accept="image/*,application/pdf"`).
    *   `📷 Cámara`: Botón inteligente.
*   **Lógica de Cámara**:
    *   **Desktop**: Abre el overlay de webcam integrado.
    *   **Móvil**: Detecta el UserAgent y dispara un input oculto con `capture="environment"` para usar la cámara nativa.
*   **Auto-enfoque**: Al agregar páginas (por archivo o cámara), el visor salta automáticamente a la última página agregada (`setIdx(arr.length - 1)`).

### 2. Layout del Canvas y Scroll
*   **Contenedor (`.ms-canvas-area`)**:
    *   Se habilitó `overflow: auto` para permitir scroll en imágenes largas.
    *   Se cambió la alineación a `flex-direction: column` y `justify-content: flex-start` para evitar que `align-items: center` recorte la parte superior de imágenes grandes.
*   **Wrapper (`.ms-canvas-wrapper`)**:
    *   Se eliminaron restricciones de altura fija.
    *   Usa `width: auto`, `height: auto` y `max-width: 100%` para adaptarse al contenedor sin forzar recortes.
    *   `margin: auto` asegura el centrado cuando la imagen es más pequeña que el área visible.

### 3. Alineación de Vértices
*   **Coordenadas**: El SVG de superposición (overlay) ahora usa un `viewBox` basado explícitamente en las dimensiones de la página (`page.w`, `page.h`).
*   **Sincronización**: Al estar el `<canvas>` y el `<svg>` dentro del mismo wrapper con `position: relative` (wrapper) y `position: absolute` (SVG), y ambos ajustándose al ancho del padre, la alineación visual es exacta.
*   **Escalado**: La función `stageToImageCoords` calcula la posición del clic basándose en el tamaño real renderizado (`getBoundingClientRect`) frente a la resolución interna, garantizando que los puntos de recorte se coloquen correctamente en la imagen original.

## Guía de Pruebas

1.  **Verificación Visual**:
    *   Abrir el escáner.
    *   Confirmar que el header solo muestra "+ Subir archivos" y "📷 Cámara".

2.  **Prueba de Carga Múltiple**:
    *   Clic en "+ Subir archivos".
    *   Seleccionar 3 imágenes de diferentes tamaños.
    *   **Resultado esperado**: Las 3 imágenes aparecen en la lista. El visor muestra la **tercera** imagen automáticamente.

3.  **Prueba de Cámara**:
    *   Clic en "📷 Cámara".
    *   **Desktop**: Debe abrir el video en pantalla completa (dentro del modal). Tomar una foto -> Se agrega y se muestra.
    *   **Móvil** (si es posible simular): Debe abrir la cámara del sistema.

4.  **Prueba de Scroll y Layout**:
    *   Cargar una imagen vertical muy alta (tipo factura larga).
    *   **Resultado esperado**: La imagen no se corta. Aparece una barra de scroll vertical en el área gris. Se puede bajar hasta el final.

5.  **Prueba de Vértices**:
    *   En una imagen recién cargada (Modo Edit), observar el recuadro azul.
    *   **Resultado esperado**: Las esquinas del recuadro (bolitas blancas) coinciden exactamente con las esquinas de la imagen visible.
    *   Arrastrar una esquina -> El punto sigue al mouse con precisión.
