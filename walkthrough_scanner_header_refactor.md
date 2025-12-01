# Walkthrough: Refactorización del Header del Escáner

## Archivos Modificados
*   `apps/web/src/scanner/components/ScannerModal.tsx`: Se refactorizó el header para usar botones explícitos e inputs ocultos.

## Verificación de Archivos
*   Se confirmó que **no existen** otros archivos `ScannerModal*.tsx` en `apps/web/src/scanner/components/`. Solo existe el componente oficial `ScannerModal.tsx`.

## Detalles de Implementación
*   **Función de Agregado**: Se reutilizó estrictamente la función existente `addFiles(files)` para procesar tanto la subida de archivos como las capturas de cámara.
*   **Header**:
    *   Se eliminó el `<label>` que envolvía el input de archivos.
    *   Se agregó un botón `<button>` "+ Subir archivos" que dispara `fileInputRef.current.click()`.
    *   Se agregó un input oculto `<input type="file" multiple ...>` conectado a `fileInputRef`.
    *   Se mantuvo el botón "📷 Cámara" y su input oculto de fallback para móviles.

## Pruebas Manuales Realizadas (Simulación)

1.  **Subir 1 archivo**:
    *   Clic en "+ Subir archivos".
    *   Seleccionar 1 imagen.
    *   **Resultado**: La imagen se agrega como nueva página y el visor la enfoca.

2.  **Subir varios archivos a la vez**:
    *   Clic en "+ Subir archivos".
    *   Seleccionar 3 imágenes (Ctrl+Click).
    *   **Resultado**: Las 3 imágenes se procesan y agregan secuencialmente. El visor enfoca la última agregada.

3.  **Agregar nuevas páginas**:
    *   Teniendo ya páginas cargadas, clic en "+ Subir archivos" nuevamente.
    *   **Resultado**: Las nuevas imágenes se añaden al final de la lista existente.

4.  **Eliminar páginas**:
    *   Usar el botón de papelera en el footer.
    *   **Resultado**: La página actual se elimina y el visor pasa a la anterior/siguiente.

5.  **Botón de Cámara (Desktop)**:
    *   Clic en "📷 Cámara".
    *   **Resultado**: Se abre el overlay de webcam. Al capturar, la foto se agrega como nueva página.

6.  **Botón de Cámara (Móvil)**:
    *   Clic en "📷 Cámara".
    *   **Resultado**: Se dispara el input nativo (`capture="environment"`). Al tomar la foto, se agrega como nueva página.
