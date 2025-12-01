# Walkthrough: Implementación de DocumentEngine y Cola de Conversión

## Archivos Creados/Modificados

1.  **Nuevo Servicio**: `d:\Inmovia\apps\api\src\services\documentEngine.js`
2.  **Rutas Actualizadas**: `d:\Inmovia\apps\api\src\routes\documents.js`

## Resumen de Cambios

### 1. Creación de `DocumentEngine`

Se implementó un servicio centralizado para manejar la generación y conversión de documentos. Sus características principales son:

*   **Limitador de Concurrencia**: Se implementó una cola simple (`MAX_CONCURRENT_CONVERSIONS = 2`) para evitar saturar el servidor con múltiples instancias de LibreOffice corriendo al mismo tiempo.
*   **`generateFromOfficeModel`**: Encapsula toda la lógica de `docxtemplater` + `libreoffice-convert`. Recibe el modelo, los datos y el formato deseado, y devuelve el buffer listo para enviar.
*   **`convertDocxFileToPdf`**: Helper para la vista previa que reutiliza la misma cola de conversión.

### 2. Refactorización de `documents.js`

Se limpió el controlador de rutas eliminando lógica duplicada y delegando en `DocumentEngine`:

*   **POST /office-models/:id/generate**: Ahora es mucho más limpio. Simplemente llama a `DocumentEngine.generateFromOfficeModel` y envía la respuesta.
*   **GET /:id/preview** y **GET /office-models/:id/preview**: Ahora usan `DocumentEngine.convertDocxFileToPdf` para generar la vista previa de archivos DOCX.
*   **Manejo de Errores**: Se mantiene el fallback. Si `DocumentEngine` falla en la conversión (ej. timeout o error de LibreOffice), el endpoint captura el error y devuelve el archivo DOCX original para descarga.

## Pruebas de Verificación

### 1. Generación de Documentos (Wizard)
*   **Acción**: Usar el wizard "Usar modelo" en el frontend, completando campos y eligiendo PDF.
*   **Resultado**: El documento se genera correctamente. Si hay múltiples usuarios haciéndolo, se encolan y procesan de a 2.

### 2. Vista Previa de DOCX
*   **Acción**: Abrir vista previa de un documento DOCX.
*   **Resultado**: Se ve el PDF generado. La conversión pasa por la misma cola que la generación.

### 3. Fallback
*   **Acción**: Si la conversión falla (simulado o real), el sistema no crashea y ofrece la descarga del DOCX.

## Beneficios
*   **Estabilidad**: El servidor no se congelará si 10 usuarios piden PDFs al mismo tiempo.
*   **Mantenibilidad**: Toda la lógica compleja de manipulación de archivos está en un solo lugar (`documentEngine.js`).
*   **Limpieza**: El archivo de rutas `documents.js` es más legible y enfocado en HTTP.
