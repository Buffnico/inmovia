# Walkthrough: Chat Interno Corporativo

## Resumen
Se ha implementado un sistema de chat interno completo, integrado con el sistema de usuarios y roles de Inmovia. Permite comunicación 1 a 1, grupos (creados por encargados) y difusión masiva (broadcast).

## Archivos Creados/Modificados

### Backend (`apps/api`)
*   **`src/models/chatConversationModel.js`**: Persistencia de conversaciones en `data/chatConversations.json`.
*   **`src/models/chatMessageModel.js`**: Persistencia de mensajes en `data/chatMessages.json`.
*   **`src/routes/chat.js`**: Endpoints de la API (`GET/POST conversations`, `messages`, `broadcast`).
*   **`src/routes/index.js`**: Registro de la ruta `/api/chat`.
*   **`src/data/officeConfig.json`**: Activación del módulo `"chat": true`.

### Frontend (`apps/web`)
*   **`src/pages/ChatInterno.tsx`**: Lógica principal y UI del chat.
*   **`src/components/ChatModals.tsx`**: Modales para crear chats, grupos y broadcast.
*   **`src/components/Sidebar.tsx`**: Integración del módulo en el menú lateral.

## Funcionalidades

### 1. Conversaciones
*   **Directas (1 a 1)**: Cualquier usuario puede iniciar un chat con otro. Si ya existe, se reutiliza.
*   **Grupales**: Solo usuarios con rol `OWNER`, `ADMIN`, `MARTILLERO` o `RECEPCIONISTA` pueden crear grupos.

### 2. Mensajería
*   Envío de texto y emojis.
*   **Adjuntos**: Soporte para subir múltiples archivos (PDF, imágenes, etc.) en un mismo mensaje.
*   **Descarga**: Los adjuntos se pueden descargar haciendo clic en el botón ⬇️.

### 3. Broadcast (Difusión)
*   Exclusivo para encargados.
*   Permite enviar un mismo mensaje a múltiples usuarios seleccionados.
*   El sistema crea/usa chats directos individuales para entregar el mensaje (no crea un grupo).

### 4. Interfaz
*   **Desktop**: Diseño de dos columnas (Lista | Chat).
*   **Móvil**: Diseño adaptativo. Muestra lista o chat a pantalla completa con navegación.
*   **Tiempo Real**: Polling automático cada 10 segundos para actualizar mensajes.

## Guía de Pruebas

### Como Agente
1.  Ingresar a "Chat interno".
2.  Verificar que **NO** aparecen los botones de "Nuevo Grupo" ni "Mensaje Masivo".
3.  Clic en "+ Chat" e iniciar conversación con otro usuario.
4.  Enviar mensaje de texto y adjuntar un archivo.

### Como Owner/Admin
1.  Ingresar a "Chat interno".
2.  Verificar que aparecen los botones de "Nuevo Grupo" (👥) y "Mensaje Masivo" (📢).
3.  **Crear Grupo**: Elegir nombre y participantes. Verificar que aparece en la lista.
4.  **Broadcast**: Enviar mensaje a 2 usuarios. Verificar que aparecen dos chats directos con el mensaje enviado.

## Notas Técnicas
*   Los archivos adjuntos se guardan en `apps/api/src/data/chat-uploads`.
*   La seguridad se maneja vía JWT (`authMiddleware`).
*   El módulo se puede desactivar poniendo `"chat": false` en `officeConfig.json`.
