# Walkthrough: Firma Digital (MVP)

## Archivos Modificados
*   `apps/api/src/models/documentModel.js`:
    *   Se actualizó `findAll` y `findById` para asegurar que todos los documentos tengan los campos `signature` (enabled, status, etc.) y timestamps (`createdAt`, `updatedAt`).
    *   Se agregó el método `update` para modificar documentos.
*   `apps/api/src/routes/documents.js`:
    *   `POST /`: Ahora acepta `signatureEnabled` en el body para marcar documentos para firma.
    *   `PATCH /:id/mark-signed`: Nuevo endpoint para cambiar el estado de firma a "FIRMADO" manualmente.
*   `apps/web/src/components/SignatureUploadModal.tsx` (Nuevo):
    *   Modal específico para subir documentos a firmar. Similar al de subida normal pero fuerza `signatureEnabled=true` y por defecto usa la categoría "Contratos".
*   `apps/web/src/pages/Documentos.tsx`:
    *   Se agregó la vista "Documentos a firmar" en el sidebar.
    *   Se implementó el filtrado para mostrar solo documentos con firma habilitada en esa vista.
    *   Se actualizaron las columnas de la tabla para mostrar "Estado" (Pendiente/Firmado) y "Última Act.".
    *   Se conectó el botón "Firma Digital" del header al nuevo modal.
    *   Se agregó el botón "✅" (Marcar como Firmado) en la vista de firma para usuarios autorizados.

## Resumen de Cambios

### Backend
*   **Modelo**: Normalización de datos en memoria para incluir objeto `signature`.
*   **Endpoints**: Soporte para creación con firma y actualización de estado.

### Frontend
*   **Vista "Documentos a firmar"**: Filtra documentos donde `signature.enabled === true`.
*   **Indicadores Visuales**: Badges naranjas para "Pendiente" y verdes para "Firmado".
*   **Acciones**: Subida específica para firma y acción manual de "Marcar como firmado".

## Guía de Pruebas Manuales

1.  **Subida Normal**:
    *   Usar "Subir Archivo" o "Nuevo Documento".
    *   Verificar que en la columna Estado aparece un guión "-" o vacío.
    *   Verificar que NO aparece en la carpeta "Documentos a firmar".

2.  **Subida para Firma**:
    *   Clic en el botón "Firma Digital" (icono ✍️ en herramientas).
    *   Subir un PDF/DOCX, asignar propiedad/cliente.
    *   Verificar que aparece en la carpeta seleccionada (ej. Contratos) con badge "Pendiente".
    *   Verificar que aparece en la carpeta "Documentos a firmar" con badge "Pendiente".

3.  **Marcar como Firmado**:
    *   Ir a "Documentos a firmar".
    *   Identificar el documento pendiente.
    *   Clic en el botón "✅" (solo visible para roles altos).
    *   Confirmar la acción.
    *   Verificar que el estado cambia a "Firmado" (badge verde) y se actualiza la fecha de modificación.

4.  **Regresiones**:
    *   Probar el Escáner y verificar que sigue guardando correctamente (como documento normal).
    *   Probar la eliminación de documentos.
