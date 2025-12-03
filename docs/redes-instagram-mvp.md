# Módulo Redes: Integración Instagram (MVP)

Este documento detalla la refactorización del módulo "Redes" para centrarse exclusivamente en Instagram, eliminando la antigua integración de WhatsApp y preparando el terreno para una futura conexión real con la API de Meta.

## Resumen de Cambios

1.  **Limpieza de WhatsApp**: Se eliminó el acceso a WhatsApp desde el sidebar y la configuración de módulos. El módulo "Redes" ahora es sinónimo de Instagram.
2.  **Nueva Estructura**: Se creó un sistema de pestañas dentro de la página de Redes para gestionar:
    *   Publicaciones (Feed)
    *   Comentarios
    *   Mensajes Directos (DM)
    *   Portadas (Generador de imágenes)
    *   Configuración de Cuentas
3.  **Soporte Multi-cuenta**:
    *   **Cuenta Personal**: Cada usuario puede configurar su propia cuenta.
    *   **Cuenta Oficina**: Los roles encargados (Owner, Admin, etc.) pueden configurar una cuenta oficial compartida.
4.  **Integración Ivo-t (Mock)**: Se prepararon los hooks visuales para que Ivo-t sugiera respuestas en comentarios y DMs.

## Archivos Clave

### Backend (`apps/api`)
*   `src/models/instagramAccountModel.js`: Persistencia de configuraciones en `data/instagramAccounts.json`.
*   `src/routes/instagram.js`: Endpoints para gestionar cuentas (`GET /my`, `POST /accounts`).
*   `src/routes/index.js`: Registro de las nuevas rutas bajo `/api/instagram`.

### Frontend (`apps/web`)
*   `src/pages/Redes.tsx`: Contenedor principal con navegación por pestañas.
*   `src/pages/RedesInstagramConfig.tsx`: Panel para conectar/editar cuentas y activar Ivo-t.
*   `src/pages/RedesInstagramPosts.tsx`: Visualización de feed y simulación de nuevos posts.
*   `src/pages/RedesInstagramComments.tsx`: Gestión de comentarios con respuestas rápidas.
*   `src/pages/RedesInstagramMensajes.tsx`: Chat tipo WhatsApp para DMs de Instagram.
*   `src/pages/RedesInstagramPortadas.tsx`: Generador de imágenes para historias.
*   `src/services/instagramService.ts`: Servicio centralizado. **Aquí es donde se debe conectar la API real**.

## Guía de Uso

### 1. Configuración Inicial
Al entrar a "Redes" por primera vez, verás el panel de configuración.
*   Haz clic en "Conectar Cuenta" en la sección Personal.
*   Ingresa tu usuario (ej. `mi.usuario`) y un nombre visible.
*   Si eres administrador, también puedes configurar la cuenta de la Oficina.

### 2. Gestión de Contenido
Una vez configurada una cuenta, usa el selector superior (si tienes más de una) para cambiar de contexto.
*   **Publicaciones**: Ve tu feed actual. El botón "Crear Publicación" simula la subida de un nuevo post.
*   **Comentarios**: Selecciona un post a la izquierda para ver y responder comentarios.
*   **Mensajes**: Chatea con tus seguidores. Usa el botón "✨ Sugerir con Ivo-t" para probar la asistencia IA.

### 3. Generador de Portadas
*   Ve a la pestaña "Portadas".
*   Selecciona una propiedad del inventario.
*   Elige una plantilla (Minimal, Elegante, Impacto).
*   Personaliza los textos y descarga la imagen para subirla manualmente a tus Stories de Instagram o WhatsApp.

## Futura Integración (API Real)

Actualmente, `instagramService.ts` utiliza datos simulados (Mocks) para posts, comentarios y mensajes. Para conectar con la API real de Instagram (Graph API):

1.  **Backend**: Implementar OAuth para obtener `access_token` real en `instagram.js`.
2.  **Frontend**:
    *   Actualizar `getFeedPosts` para llamar al endpoint real que consulte `me/media`.
    *   Actualizar `getInboxThreads` y `getThreadMessages` para usar la API de mensajería de Instagram.
    *   Reemplazar las simulaciones de envío (`sendDmMessage`, `sendCommentReply`) por llamadas POST reales a la API.

El modelo de datos en frontend (`IgPost`, `IgComment`, etc.) ya está diseñado para ser compatible con la estructura básica de la API de Meta.
