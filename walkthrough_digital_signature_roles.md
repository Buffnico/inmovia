# Walkthrough: Firma Digital con Roles y Agentes

## Archivos Modificados
*   `apps/api/src/models/documentModel.js`:
    *   Se extendió el objeto `signature` con `requestedBy`, `requestedAt`, `approvedBy`, `approvedAt`.
    *   Se agregó el campo `agentUserId` al modelo de documento.
    *   Se normalizaron estos campos en `findAll`, `findById` y `create`.
*   `apps/api/src/routes/documents.js`:
    *   `POST /`:
        *   Valida que el archivo sea PDF si es firma digital.
        *   Si el usuario es Encargado (Owner/Admin/Martillero/Recepcionista): estado `PENDIENTE`, asigna `agentUserId` si se envía.
        *   Si el usuario es Agente: estado `SOLICITADO`, asigna `agentUserId` al usuario actual.
    *   `PATCH /:id/approve-signature`: Nuevo endpoint para que encargados aprueben documentos en estado `SOLICITADO` -> `PENDIENTE`.
    *   `PATCH /:id/mark-signed`: Solo permite marcar como firmado si está en `PENDIENTE`.
*   `apps/web/src/components/SignatureUploadModal.tsx`:
    *   Acepta prop `canSendToSignature`.
    *   Solo permite subir archivos PDF.
    *   Si es Encargado: muestra selector de Agente Responsable y botón "Enviar a firma".
    *   Si es Agente: oculta selector (auto-asigna) y botón "Solicitar firma".
*   `apps/web/src/pages/Documentos.tsx`:
    *   Actualizada interfaz `Document` con nuevos campos.
    *   Filtro "Documentos a firmar":
        *   Encargados ven TODOS los documentos.
        *   Agentes ven SOLO sus documentos (`agentUserId` o `ownerUserId`).
    *   Tabla:
        *   Badges para estados `SOLICITADO` (Azul), `PENDIENTE` (Naranja), `FIRMADO` (Verde).
        *   Botón de descarga (⬇️) para todos.
        *   Botón de aprobar (👍) para encargados en documentos solicitados.
        *   Botón de firmar (✅) para encargados en documentos pendientes.

## Flujo de Datos `signature`

El objeto `signature` ahora maneja el ciclo de vida completo:

1.  **Solicitud (Agente)**:
    *   `enabled: true`
    *   `status: "SOLICITADO"`
    *   `requestedBy`: ID del agente
    *   `agentUserId`: ID del agente

2.  **Aprobación (Encargado)**:
    *   `status: "PENDIENTE"`
    *   `approvedBy`: ID del encargado

3.  **Firma (Encargado/Sistema)**:
    *   `status: "FIRMADO"`
    *   `signedAt`: Fecha actual

## Guía de Pruebas Manuales

1.  **Prueba como Agente**:
    *   Entrar como usuario con rol `AGENTE`.
    *   Ir a "Firma Digital" -> Subir PDF.
    *   Verificar que NO aparece selector de agente.
    *   Verificar que el documento aparece en "Documentos a firmar" con estado "Solicitado".
    *   Verificar que NO tiene botones de aprobar ni firmar.

2.  **Prueba como Encargado (Owner/Admin)**:
    *   Entrar como `OWNER` o `ADMIN`.
    *   Ir a "Documentos a firmar".
    *   Debe ver el documento del agente.
    *   Probar botón "Descargar" (⬇️).
    *   Probar botón "Aprobar" (👍) -> Estado cambia a "Pendiente".
    *   Probar botón "Marcar como Firmado" (✅) -> Estado cambia a "Firmado".

3.  **Prueba de Envío Directo (Encargado)**:
    *   Usar botón "Firma Digital".
    *   Seleccionar un Agente en el dropdown.
    *   Subir PDF.
    *   Verificar que el documento nace directamente en estado "Pendiente" y asignado al agente elegido.
