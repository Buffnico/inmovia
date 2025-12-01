# Walkthrough: Corrección de Errores en Generación de Documentos

## Archivos Modificados

1.  **Servicio**: `d:\Inmovia\apps\api\src\services\documentEngine.js`

## Resumen de Cambios

### 1. Manejo de Errores en `docxtemplater`

Se detectó que la generación de documentos fallaba silenciosamente o con mensajes genéricos ("Multi error") cuando la plantilla tenía problemas (como etiquetas mal cerradas o duplicadas).

Se modificó el método `generateFromOfficeModel` en `documentEngine.js` para:

*   **Configuración Explícita**: Se agregaron los delimitadores estándar `{{` y `}}` a la configuración de `Docxtemplater` para asegurar consistencia.
*   **Bloque Try/Catch**: Se envolvió la llamada a `doc.render(dataMap)` en un bloque `try/catch`.
*   **Extracción de Detalles**: En caso de error, se inspecciona la propiedad `error.properties.errors` (propia de docxtemplater) para extraer explicaciones legibles (ej. "The tag beginning with '{{nomb' has duplicate open tags").
*   **Re-lanzamiento de Error**: Se lanza un nuevo error con el mensaje detallado, lo que permite que el frontend muestre al usuario exactamente qué está mal en su plantilla de Word.

## Pruebas de Verificación

### 1. Plantilla Correcta
*   **Acción**: Generar documento con plantilla válida (`Hola {{nombre}}`).
*   **Resultado**: Generación exitosa (PDF o DOCX).

### 2. Plantilla con Error (Simulado)
*   **Acción**: Generar documento con plantilla rota (ej. `{{nombre` sin cerrar).
*   **Resultado**: El backend loguea el error específico y devuelve un mensaje claro al cliente: "Error en la plantilla del documento: The tag beginning with...".

### 3. Concurrencia
*   **Acción**: Generar múltiples documentos.
*   **Resultado**: La cola de conversión sigue funcionando correctamente, limitando a 2 procesos simultáneos.

## Conclusión

El sistema ahora es robusto frente a errores de sintaxis en las plantillas de Word subidas por los usuarios, proporcionando feedback útil en lugar de fallos genéricos.
