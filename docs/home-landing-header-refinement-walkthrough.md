# Walkthrough: HomeLanding Header Refinement

He actualizado el header de la landing page para darle un aspecto "SaaS Premium" más pulido y profesional.

## Archivos Modificados
- `apps/web/src/pages/HomeLanding.tsx`: Se agregaron las clases `hl-nav`, `hl-nav-inner`, `hl-nav-menu`, `hl-nav-right`, `hl-nav-link` y `hl-nav-cta` a los elementos del header.
- `apps/web/src/styles/HomeLanding.css`: Se agregaron los estilos CSS correspondientes al final del archivo.

## Cambios Visuales
- **Barra Superior (Header)**:
  - Ahora es **sticky** y se mantiene visible al scrollear.
  - Tiene un fondo blanco con **transparencia y blur** (`backdrop-filter: blur(14px)`), dándole un toque moderno.
  - Se agregó un borde inferior muy sutil para separarlo del contenido.
  - La altura y el padding vertical aumentaron ligeramente para mayor presencia.
- **Menú de Navegación**:
  - Los enlaces ahora tienen un **efecto hover** con una línea azul animada que aparece debajo.
  - El espaciado entre ítems se ajustó para mejor legibilidad.
- **Botones de Acción**:
  - El botón "Probar gratis" es un poco más alto (`padding: 10px 18px`).
  - El enlace "Iniciar sesión" tiene un estilo más limpio.
- **Layout**:
  - El contenido del header ahora está centrado con un ancho máximo de **1120px**, alineándose con estándares de diseño premium.
  - En móviles, el menú se oculta elegantemente manteniendo el logo y los botones accesibles.
