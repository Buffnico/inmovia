# Refactorización UI Redes - Layout tipo Chat Interno

Este documento detalla la refactorización visual del módulo **Redes (Instagram)** para alinearse con el diseño del módulo **Chat Interno**, utilizando un layout de tarjeta central con barra lateral de herramientas.

## Cambios Realizados

### 1. Layout General (`Redes.tsx`)
-   **Eliminación de Elementos Globales**: Se eliminó el título superior "Redes – Instagram" y el selector de cuentas global que estaba fuera del área de contenido.
-   **Nueva Estructura**: Se implementó un contenedor principal (`.redes-layout-card`) que ocupa todo el espacio disponible.
-   **Mini-Sidebar Izquierda**: Se creó una barra lateral dentro de la tarjeta para la navegación entre herramientas:
    -   🖼 Publicaciones
    -   💬 Comentarios
    -   ✉️ Mensajes (DM)
    -   🎨 Portadas
    -   ⚙️ Configuración
-   **Área de Contenido Derecha**: El componente seleccionado se renderiza en el panel derecho, ocupando el resto del espacio.

### 2. Estilos (`RedesInstagram.css`)
-   Se definieron nuevas clases para el layout de tarjeta (`.redes-layout-card`, `.redes-sidebar`, `.redes-main-content`).
-   Se estilizaron los botones de navegación de la sidebar (estado activo con azul Inmovia).
-   **Responsive**: En dispositivos móviles, la sidebar se convierte en una barra de navegación horizontal superior, y el contenido ocupa el 100% del ancho.

### 3. Mensajes (DM)
-   La sección de Mensajes (`RedesInstagramMensajes.tsx`) se integra perfectamente en el panel derecho.
-   Mantiene su propia estructura interna de dos columnas (Lista de Chats + Chat Activo), similar a Instagram Direct.
-   En móviles, se comporta como una aplicación nativa: lista de chats primero -> chat completo al seleccionar.

## Archivos Modificados
-   `apps/web/src/pages/Redes.tsx`: Reescritura completa del layout.
-   `apps/web/src/pages/RedesInstagram.css`: Nuevos estilos para el layout y limpieza de estilos antiguos de pestañas.
-   `apps/web/src/pages/RedesInstagramMensajes.tsx`: Verificación de integración (sin cambios mayores de lógica).
-   `apps/web/src/pages/RedesInstagramPosts.tsx`: Verificación de estilos (modal, feed).

## Guía de Pruebas

### Desktop
1.  **Navegación**: Entrar a la pestaña **Redes**.
2.  **Visualización**: Verificar que no hay título duplicado arriba y que todo está contenido en una tarjeta blanca con borde suave.
3.  **Sidebar**: Clicar en cada icono de la izquierda (Publicaciones, Comentarios, etc.) y verificar que el contenido derecho cambia instantáneamente.
4.  **Mensajes**: Entrar a Mensajes. Verificar que aparece la lista de chats a la izquierda (dentro del panel derecho) y el chat a la derecha.
5.  **Configuración**: Verificar que muestra la cuenta conectada actual.

### Mobile
1.  **Layout**: Verificar que la sidebar izquierda desaparece y se muestran los iconos en una fila superior.
2.  **Mensajes**: Al entrar a Mensajes, se debe ver la lista de chats a pantalla completa. Al tocar un chat, debe abrirse la conversación tapando la lista. Usar el botón "←" para volver.

## Walkthrough de Implementación
1.  Se analizó el requerimiento de unificar la UI con el estilo de "Chat Interno".
2.  Se modificó `RedesInstagram.css` para crear las clases del nuevo layout (grid/flex).
3.  Se reescribió `Redes.tsx` para implementar la estructura de tarjeta y sidebar, eliminando los tabs superiores antiguos.
4.  Se ajustaron los estilos para asegurar que los componentes hijos (`Posts`, `Mensajes`) se expandan correctamente (`flex: 1`).
5.  Se verificó la responsividad y se añadieron estilos faltantes para modales.
