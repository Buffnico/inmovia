# Walkthrough: Guardar Escaneo en Documentos

## Archivos Modificados
*   `apps/web/src/components/UploadDocumentModal.tsx`:
    *   Se agregaron props `initialFile` y `initialTitle`.
    *   Se adaptó la UI para mostrar el nombre del archivo pre-cargado en lugar del input de archivo cuando `initialFile` está presente.
    *   Se pre-llena el título si se provee `initialTitle`.
*   `apps/web/src/scanner/components/ScannerModal.tsx`:
    *   Se agregó la prop `onSaveToDocuments`.
    *   Se implementó la función `handleSaveToDocuments` que genera el PDF en memoria y llama al callback.
    *   Se agregó el botón **"Guardar en Documentos"** en el footer, visible solo si hay páginas escaneadas.
*   `apps/web/src/pages/Documentos.tsx`:
    *   Se agregaron estados `scanGeneratedFile` y `isUploadFromScanOpen`.
    *   Se conectó el `ScannerModal` con el `UploadDocumentModal` mediante el callback `onSaveToDocuments`.
    *   Se renderiza una instancia condicional de `UploadDocumentModal` para el flujo de escaneo.

## Flujo Completo
1.  **Escanear**: El usuario abre el escáner y captura/sube imágenes.
2.  **Guardar**: Al hacer clic en "Guardar en Documentos", se genera un PDF en memoria.
3.  **Subir**: Se abre automáticamente el modal de "Subir Documento" con el PDF ya cargado y un título sugerido (ej. "Escaneo_2023-10-27...").
4.  **Confirmar**: El usuario selecciona categoría, propiedad o cliente (opcional) y hace clic en "Subir".
5.  **Finalizar**: El documento se sube al servidor, la lista de documentos se actualiza y el escáner se cierra.

## Pruebas Manuales Realizadas (Simulación)
1.  **Subida Normal**: Verificar que el botón "Subir Archivo" del dashboard sigue funcionando como siempre (pide seleccionar archivo).
2.  **Escaneo y Guardado**:
    *   Abrir Escáner -> Agregar páginas -> Click "Guardar en Documentos".
    *   Verificar que se abre el modal de subida sin pedir archivo.
    *   Completar subida y verificar que aparece en la lista.
3.  **Descarga Local**: Verificar que "Generar PDF" y "Descargar JPG" en el escáner siguen funcionando (descarga al disco).
