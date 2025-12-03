# Solución de Problemas de Producción (Login + CSV)

Este documento detalla los cambios realizados para solucionar los problemas de login y carga de CSV en el entorno de producción (Vercel + Render).

## 1. Diagnóstico

### Frontend (Vercel)
*   **Inconsistencia de URL**: Se detectó que `authService.ts` usaba `VITE_API_URL` mientras que otros componentes usaban `VITE_API_BASE_URL`.
*   **Falta de Fallback**: No había una lógica centralizada para manejar la URL de la API, lo que podía causar errores si las variables de entorno no estaban perfectamente configuradas.
*   **Mensajes de Error**: El usuario veía "Failed to fetch" en lugar de un mensaje amigable cuando fallaba la conexión.

### Backend (Render)
*   **Healthcheck**: Faltaba el endpoint `/api/health` para verificar el estado de la API.
*   **CORS**: Se ajustó la configuración para permitir explícitamente el dominio de Vercel y subdominios (`.vercel.app`).

## 2. Cambios Realizados

### Frontend (`apps/web`)

1.  **Nuevo Cliente API Centralizado (`src/services/apiClient.ts`)**:
    *   Se creó un módulo único para manejar las peticiones a la API.
    *   Utiliza `VITE_API_BASE_URL` como fuente de verdad.
    *   En desarrollo, hace fallback automático a `http://localhost:3001/api`.
    *   En producción, advierte si falta la variable de entorno.
    *   Maneja automáticamente la inclusión del token de autenticación (Bearer) y credenciales.

2.  **Refactorización de Servicios**:
    *   `src/services/authService.ts`: Actualizado para usar `apiClient`. Se mejoró el manejo de errores para evitar "Failed to fetch".
    *   `src/pages/Propiedades.tsx`: Actualizado para usar `apiClient` en el listado de propiedades.
    *   `src/components/Propiedades/ImportarModal.tsx`: Actualizado para usar `apiClient` en la subida de CSV (usando `FormData`).

### Backend (`apps/api`)

1.  **Nuevo Endpoint de Healthcheck**:
    *   Se agregó `GET /api/health` en `src/routes/index.js`.
    *   Responde con `{ status: "ok", env: "...", time: "..." }`.

2.  **Configuración de CORS (`src/server.js`)**:
    *   Se restringieron los orígenes permitidos a `localhost:5173` y dominios de Vercel (`inmovia.vercel.app` y `*.vercel.app`).
    *   Esto mejora la seguridad en producción.

## 3. Verificación y Despliegue

### Pasos para probar en Producción

1.  **Variables de Entorno (Vercel)**:
    *   Asegurarse de que `VITE_API_BASE_URL` esté definida en el proyecto de Vercel.
    *   Valor esperado: `https://<tu-app-en-render>.onrender.com/api` (sin slash final preferiblemente).

2.  **Healthcheck**:
    *   Navegar a `https://<tu-app-en-render>.onrender.com/api/health`.
    *   Debe responder JSON con status ok.

3.  **Login**:
    *   Intentar iniciar sesión. Si falla por red, debería mostrar "No se pudo conectar con el servidor...".
    *   Verificar en Network que la petición vaya a la URL de Render.

4.  **Importar CSV**:
    *   Ir a Propiedades -> Importar CSV.
    *   Subir un archivo. Verificar en Network que la petición sea `POST .../properties/importar/remax-excel`.

## 4. Archivos Modificados

*   `apps/web/src/services/apiClient.ts` (Nuevo)
*   `apps/web/src/services/authService.ts`
*   `apps/web/src/pages/Propiedades.tsx`
*   `apps/web/src/components/Propiedades/ImportarModal.tsx`
*   `apps/api/src/server.js`
*   `apps/api/src/routes/index.js`
