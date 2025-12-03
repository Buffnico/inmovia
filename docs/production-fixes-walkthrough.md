# Solución de Problemas de Producción (Vercel + Render)

Este documento detalla los cambios realizados para solucionar los problemas de login y carga de CSV en el entorno de producción.

## 1. Diagnóstico

### Frontend (Vercel)
*   **Inconsistencia de URL**: Se detectó que `authService.ts` usaba `VITE_API_URL` mientras que otros componentes usaban `VITE_API_BASE_URL`.
*   **Falta de Fallback**: No había una lógica centralizada para manejar la URL de la API, lo que podía causar errores si las variables de entorno no estaban perfectamente configuradas.

### Backend (Render)
*   **Healthcheck**: Faltaba el endpoint `/api/health` que se intentaba consultar para verificar el estado.
*   **CORS**: Configurado como `origin: true`, lo cual es permisivo y generalmente aceptable, pero se verificó que `credentials: true` estuviera presente.

## 2. Cambios Realizados

### Frontend (`apps/web`)

1.  **Nuevo Cliente API Centralizado (`src/services/apiClient.ts`)**:
    *   Se creó un módulo único para manejar las peticiones a la API.
    *   Utiliza `VITE_API_BASE_URL` como fuente de verdad.
    *   En desarrollo, hace fallback automático a `http://localhost:3001/api`.
    *   En producción, advierte si falta la variable de entorno.
    *   Maneja automáticamente la inclusión del token de autenticación (Bearer) y credenciales.

2.  **Refactorización de Servicios**:
    *   `src/services/authService.ts`: Actualizado para usar `apiClient`.
    *   `src/pages/Propiedades.tsx`: Actualizado para usar `apiClient` en el listado de propiedades.
    *   `src/components/Propiedades/ImportarModal.tsx`: Actualizado para usar `apiClient` en la subida de CSV.

### Backend (`apps/api`)

1.  **Nuevo Endpoint de Healthcheck**:
    *   Se agregó `GET /api/health` en `server.js` que responde `{ ok: true, status: "healthy" }`.
    *   Esto permite verificar rápidamente si la API está respondiendo en producción.

## 3. Verificación y Despliegue

### Pasos para probar en Producción

1.  **Variables de Entorno (Vercel)**:
    *   Asegurarse de que `VITE_API_BASE_URL` esté definida en el proyecto de Vercel.
    *   Valor esperado: `https://<tu-app-en-render>.onrender.com/api` (sin slash final preferiblemente, aunque el cliente lo maneja).

2.  **Healthcheck**:
    *   Navegar a `https://<tu-app-en-render>.onrender.com/api/health`.
    *   Debe responder JSON con status healthy.

3.  **Login**:
    *   Intentar iniciar sesión. Si falla, revisar la consola del navegador (F12) -> Network.
    *   Verificar que la petición vaya a la URL de Render y no a localhost.

4.  **Importar CSV**:
    *   Ir a Propiedades -> Importar CSV.
    *   Subir un archivo. Verificar en Network que la petición sea `POST .../properties/importar/remax-excel`.

## 4. Notas Adicionales

*   **CORS**: Si persisten problemas de CORS en producción, podría ser necesario especificar el dominio de Vercel explícitamente en `server.js` en lugar de `origin: true`.
    ```javascript
    app.use(cors({
      origin: ["https://tu-dominio-vercel.app", "http://localhost:5173"],
      credentials: true
    }));
    ```
*   **Re-deploy**: Es necesario redeplegar tanto el backend (para el healthcheck) como el frontend (para el nuevo cliente API).
