# Walkthrough: Rediseño Premium del Módulo Redes (Instagram)

Se ha realizado un rediseño completo del módulo de Redes (Instagram) para ofrecer una experiencia de usuario "premium", similar a herramientas profesionales como Meta Business Suite, pero integrada con la estética de Inmovia.

## Resumen de Cambios

El módulo ahora cuenta con 5 secciones principales, todas operando en **modo demo** con datos simulados, listas para presentaciones comerciales.

### 1. Publicaciones (Creador de Posts)
- **Layout de dos columnas**: Editor a la izquierda, previsualización en tiempo real a la derecha.
- **Previsualización realista**: Se muestra un marco de teléfono móvil que refleja exactamente cómo se verá el post en Instagram.
- **Herramientas de edición**:
  - Selector de propiedad integrado.
  - Selector de tipo de post (Clásico, Carrusel, Reel).
  - Checkboxes para mostrar/ocultar precio, ubicación y características.
  - **Integración con Ivo-t**: Botón "Sugerir con Ivo-t" para generar descripciones automáticas.

### 2. Comentarios
- **Layout de tres columnas**: Lista de posts, hilo de comentarios y panel de respuesta.
- **Gestión eficiente**: Permite navegar rápidamente entre publicaciones y ver la conversación.
- **Respuestas inteligentes**: Botón destacado para sugerir respuestas con IA (Ivo-t).

### 3. Mensajes (DM)
- **Bandeja de entrada estilo chat**: Lista de conversaciones a la izquierda, chat a la derecha.
- **Indicadores de estado**: Banner de "Modo Demo" para aclarar que no es una conexión real aún.
- **Interfaz limpia**: Burbujas de chat diferenciadas y panel de escritura moderno.

### 4. Portadas (Stories)
- **Generador de plantillas**: Selector visual de estilos (Minimalista, Elegante, Impacto).
- **Personalización**: Opciones para incluir precio, título y ubicación en la imagen.
- **Previsualización vertical**: Marco de teléfono 9:16 para ver el resultado final.

### 5. Configuración
- **Panel de estado**: Indicador claro de "Modo Demo".
- **Gestión de cuentas**: Tarjetas para configurar cuenta personal y de oficina.
- **Ajustes de IA**: Toggles para activar sugerencias y respuestas automáticas.

## Archivos Modificados
- `apps/web/src/pages/RedesInstagram.css`: Nuevos estilos para marcos de teléfono, tarjetas, chats y layouts.
- `apps/web/src/pages/RedesInstagramPosts.tsx`: Nuevo editor de publicaciones.
- `apps/web/src/pages/RedesInstagramComments.tsx`: Nuevo gestor de comentarios.
- `apps/web/src/pages/RedesInstagramMensajes.tsx`: Nueva bandeja de entrada DM.
- `apps/web/src/pages/RedesInstagramPortadas.tsx`: Nuevo generador de Stories.
- `apps/web/src/pages/RedesInstagramConfig.tsx`: Nueva pantalla de configuración.

## Cómo Probar
1. Ejecutar `npm run dev` en `apps/web`.
2. Navegar a la sección **Redes** en el menú lateral.
3. Explorar las diferentes pestañas para ver la nueva interfaz y probar las interacciones simuladas.
