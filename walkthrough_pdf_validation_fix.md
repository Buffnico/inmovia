# Walkthrough: Validación de PDF y Manejo de Errores

## Archivos Modificados

1.  **Servicio**: `d:\Inmovia\apps\api\src\services\documentEngine.js`
2.  **Rutas**: `d:\Inmovia\apps\api\src\routes\documents.js`

## Resumen de Cambios

### 1. Validación de Firma PDF
Se detectó que, en caso de fallo silencioso de LibreOffice, se devolvía un archivo DOCX con extensión `.pdf`, lo que causaba errores en el visor del navegador.

*   **`convertDocxBufferToPdf`**: Ahora verifica que el buffer resultante comience con la firma `%PDF`. Si no es así (o si el buffer es nulo/vacío), lanza un error explícito `PDF_SIGNATURE_INVALID` con código `CONVERT_ERROR`.

### 2. Manejo de Errores de Conversión
Se mejoró la robustez del sistema ante fallos en la generación de PDFs.

*   **`generateFromOfficeModel`**:
    *   Maneja explícitamente el formato `docx` devolviendo el buffer sin intentar convertir.
    *   Para `pdf`, captura errores de conversión y los re-lanza con código `CONVERT_ERROR`.
    *   Incluye un fallback de seguridad para formatos desconocidos (devuelve DOCX).

*   **Endpoints de Preview (`GET .../preview`)**:
    *   Si la conversión a PDF falla (por cualquier motivo, incluido timeout o firma inválida), se captura el error.
    *   **Fallback**: Se envía el archivo original DOCX con el Content-Type correcto (`application/vnd.openxmlformats...`) y Content-Disposition `attachment`. Esto hace que el navegador descargue el archivo en lugar de intentar mostrar un PDF roto.

*   **Endpoint de Generación (`POST .../generate`)**:
    *   Ahora distingue tipos de errores:
        *   `TEMPLATE_ERROR` (400): Problemas de sintaxis en el DOCX (tags mal cerrados).
        *   `CONVERT_ERROR` (500): Fallo al crear el PDF. Mensaje claro al usuario sugiriendo usar DOCX.
        *   Otros (500): Error genérico.

## Pruebas de Verificación

### 1. Generación Exitosa
*   **Acción**: Generar PDF desde un modelo válido.
*   **Resultado**: Se descarga un archivo `.pdf` real (empieza con `%PDF`) que abre correctamente.

### 2. Fallo de Conversión (Simulado)
*   **Acción**: Forzar error en LibreOffice o devolver buffer basura.
*   **Resultado**:
    *   En Preview: Se descarga el archivo `.docx` original.
    *   En Generación: El usuario recibe un mensaje de error "No se pudo convertir el documento a PDF...".

### 3. Plantilla Inválida
*   **Acción**: Subir DOCX con `{{tag` sin cerrar.
*   **Resultado**: Error 400 con detalle "La plantilla Word tiene errores...".

## Conclusión
El sistema ahora garantiza que nunca se entregue un archivo corrupto o con extensión incorrecta. Los errores se comunican claramente al usuario final.
