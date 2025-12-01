# Walkthrough: Chat Interno UI Polish

## Resumen
Se ha realizado un refactor visual completo del módulo "Chat Interno" para alinearlo con una estética corporativa moderna (estilo WhatsApp/Teams) manteniendo la identidad visual de Inmovia.

## Archivos Modificados
*   **`apps/web/src/pages/ChatInterno.tsx`**: Reescritura completa de la estructura del componente para soportar el nuevo diseño.
    *   Implementación de `mobileView` para navegación en móviles.
    *   Integración de selector de emojis nativo.
    *   Mejora en la renderización de burbujas de mensaje y adjuntos.
*   **`apps/web/src/pages/ChatInterno.css`**: Hoja de estilos completamente nueva.
    *   Diseño de dos columnas con sidebar fijo y área de chat flexible.
    *   Estilos de burbujas distintivos (azul para propios, blanco para otros).
    *   Adaptación responsive completa.

## Decisiones de Diseño

### Sidebar (Lista de Conversaciones)
*   **Header**: Se organizaron las acciones principales (`+ Chat`, `Grupo`, `Masivo`) en botones tipo "pill" para acceso rápido.
*   **Buscador**: Se expandió a ancho completo con ícono integrado para mayor claridad.
*   **Items**: Cada conversación muestra ahora avatar, nombre, snippet del último mensaje y hora, facilitando el escaneo rápido.

### Área de Mensajes
*   **Header Fijo**: Muestra siempre con quién se está hablando y el estado (ej. número de participantes en grupos).
*   **Burbujas**:
    *   **Propios**: Alineados a la derecha, fondo azul Inmovia, texto blanco.
    *   **Otros**: Alineados a la izquierda, fondo blanco, texto oscuro.
    *   **Grupos**: Se muestra el nombre del remitente en color ámbar para diferenciarlo.
*   **Adjuntos**: Se visualizan como tarjetas dentro de la burbuja con botón de descarga directo.

### Composer (Barra de Escritura)
*   Diseño flotante/fijo en la parte inferior con bordes redondeados.
*   Integración de botón de adjuntos (clip) y emojis (cara feliz) directamente en la barra.
*   Input de texto limpio sin bordes duros.

### Responsive / Mobile
*   En pantallas pequeñas (<768px), la interfaz se comporta como una aplicación nativa:
    *   Muestra inicialmente solo la lista.
    *   Al seleccionar un chat, este ocupa toda la pantalla.
    *   Botón "←" en el header del chat para volver a la lista.
    *   Se ocultan elementos innecesarios como el título de la página para ganar espacio vertical.

## Notas Técnicas
*   **No se modificó el backend**: Todos los endpoints y modelos de datos permanecen intactos.
*   **Roles**: La lógica de visualización de botones de grupo/broadcast sigue respetando los roles de usuario (Owner/Admin/etc.).
*   **Emojis**: Se implementó un picker simple en React sin dependencias externas para mantener el proyecto ligero.
