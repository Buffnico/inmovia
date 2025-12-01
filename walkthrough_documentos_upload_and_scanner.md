# Walkthrough: Documentos Personales, Upload Modal y Escáner Mejorado

## Archivos Modificados/Creados

1.  **Backend**:
    *   `apps/api/src/routes/documents.js`: Lógica de filtrado por usuario, migración de documentos antiguos, y manejo de nuevos metadatos en subida.

2.  **Frontend**:
    *   `apps/web/src/components/UploadDocumentModal.tsx` (Nuevo): Modal para subir archivos con título, categoría, propiedad y cliente.
    *   `apps/web/src/pages/Documentos.tsx`: Integración del nuevo modal, limpieza de sidebar (eliminado "Bóveda" y "Escáner clásico"), y actualización de la tabla.
    *   `apps/web/src/scanner/components/ScannerModal.tsx`: Agregado soporte para cámara y captura multipágina.

## Resumen de Cambios

### 1. Documentos Personales (Backend)
*   **Filtrado**: `GET /api/documents` ahora filtra por `ownerUserId === req.user.id`.
*   **Migración**: Si un documento antiguo no tiene `ownerUserId`, se le asigna automáticamente al usuario que hace la petición para no perderlo.
*   **Propiedades**: Se popula el campo `property` con la dirección/código si existe `propertyId`.

### 2. Nuevo Modal de Subida
*   Reemplaza el input de archivo simple.
*   Permite ingresar:
    *   **Título**: Opcional (fallback a nombre de archivo).
    *   **Categoría**: Dropdown con opciones predefinidas.
    *   **Propiedad**: Búsqueda y selección de propiedades activas.
    *   **Cliente**: Búsqueda y selección de contactos.

### 3. Mejoras en UI Documentos
*   **Sidebar**: Se eliminaron "Bóveda privada" y el toggle de "Escáner clásico".
*   **Tabla**:
    *   Muestra el `title` del documento.
    *   Muestra la Propiedad asociada (si la hay).
    *   Los contadores de carpetas reflejan las nuevas categorías.

### 4. Escáner con Cámara
*   Se agregó botón **"📷 Usar Cámara"** en el modal del escáner.
*   Permite capturar múltiples fotos en una misma sesión.
*   Las fotos se agregan a la lista de páginas y se pueden exportar juntas en un solo PDF.

## Pruebas Manuales Realizadas

1.  **Subida de Archivo**:
    *   Se verificó la apertura del modal.
    *   Se completaron los campos (Título, Categoría, Propiedad).
    *   La subida fue exitosa y el documento apareció en la lista con los datos correctos.

2.  **Documentos Personales**:
    *   Se confirmó que cada usuario ve solo sus documentos (simulado mediante asignación de `ownerUserId`).

3.  **Escáner**:
    *   Se probó el acceso a la cámara.
    *   Se capturaron múltiples páginas.
    *   Se verificó que se agregan a la tira de imágenes y se pueden editar/recortar individualmente.

4.  **Oficina Modelos**:
    *   Se verificó que esta sección sigue funcionando independientemente de los cambios en documentos personales.
