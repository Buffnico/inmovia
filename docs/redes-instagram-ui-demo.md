# Redes – Instagram UI Demo

Este documento describe la implementación del demo de interfaz de usuario para el módulo de Redes (Instagram) en Inmovia.

## Resumen
Se ha maquetado una interfaz completa para la gestión de Instagram, simulando todas las funcionalidades clave sin depender de la API real de Meta por el momento. El objetivo es permitir demostraciones visuales y pruebas de UX antes de la integración técnica final.

## Funcionalidades Implementadas (Mocks)

### 1. Gestión de Cuentas
- **Selector de Cuenta**: Permite alternar entre cuenta "Personal" y "Oficina" desde el header.
- **Configuración**: Panel para conectar cuentas (simulado) y activar las funciones de IA (Ivo-t).

### 2. Publicaciones (Feed)
- Vista de grilla de publicaciones recientes.
- Botón "Crear Publicación" con modal simulado para subir fotos/videos.
- Indicadores de likes y comentarios.

### 3. Comentarios
- Diseño de dos columnas (escritorio) para navegar entre posts y sus hilos de comentarios.
- **Ivo-t**: Botón "✨ Sugerir respuesta" que rellena automáticamente el campo de texto con una respuesta sugerida.

### 4. Mensajes Directos (Instagram Direct)
- Interfaz estilo chat de Instagram.
- Lista de conversaciones a la izquierda con avatares e indicadores de no leídos.
- Chat a la derecha con burbujas de mensajes (propios en azul, ajenos en gris).
- **Ivo-t**: Sugerencia de respuestas rápidas en el chat.
- Diseño responsivo: En móviles se comporta como una app nativa (lista -> detalle).

### 5. Generador de Portadas (Stories)
- Herramienta visual para crear imágenes para Stories de Instagram/WhatsApp.
- Selección de propiedad del inventario (mock).
- Selección de plantillas (Minimal, Elegante, Impacto).
- Personalización de textos y descarga simulada.

## Archivos Clave

- `apps/web/src/pages/Redes.tsx`: Contenedor principal.
- `apps/web/src/pages/RedesInstagram*.tsx`: Sub-módulos (Posts, Comments, Mensajes, Portadas, Config).
- `apps/web/src/pages/RedesInstagram.css`: Estilos específicos para imitar la UI de Instagram manteniendo la identidad de Inmovia.
- `apps/web/src/services/instagramService.ts`: Contiene todos los datos de prueba (mocks) y tipos TypeScript.

## Cómo probar el Demo

1. Navegar a la sección **Redes** en el sidebar.
2. Si aparece "No tienes cuentas", ir a **Configuración** y hacer clic en "Conectar Cuenta" (Personal u Oficina).
3. Usar las pestañas superiores para explorar:
   - **Publicaciones**: Ver el feed y probar "Crear Publicación".
   - **Comentarios**: Seleccionar un post y responder un comentario (probar el botón de Ivo-t).
   - **Mensajes**: Abrir un chat y enviar mensajes.
   - **Portadas**: Generar una imagen para una propiedad.

## Próximos Pasos (Integración Real)

Para pasar a producción con datos reales:
1. Implementar OAuth con Facebook/Instagram en el backend.
2. Reemplazar los arrays estáticos en `instagramService.ts` por llamadas a los endpoints de la API de Inmovia (que a su vez llamará a Graph API).
3. Implementar la subida real de archivos (imágenes/videos).
4. Conectar el generador de portadas con `html2canvas` o similar para generar el JPG real.
