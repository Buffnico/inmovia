# Walkthrough: HomeLanding Full Width (Layout Final)

He actualizado los estilos para que la landing page aproveche el ancho completo de la pantalla en desktop, manteniendo una experiencia limpia en mobile.

## 1. Cambios en CSS (`apps/web/src/styles/HomeLanding.css`)

### Layout de Escritorio (Full Width)
- **Contenedores**: Se eliminó el `max-width: 1200px` fijo. Ahora `.home-header-inner`, `.home-hero-inner` y `.home-container` usan `width: 100%` con `max-width: none`.
- **Padding Lateral**: Se estandarizó en `72px` a cada lado para dar aire y elegancia en pantallas grandes.
- **Hero Grid**:
  - Se ajustó el grid a `minmax(0, 1.2fr) minmax(0, 1fr)` para dar un poco más de espacio al texto principal.
  - Se aumentó el gap a `72px`.
  - El párrafo descriptivo ahora tiene un `max-width: 620px` para evitar que se vea demasiado angosto.

### Layout Mobile (< 900px)
- **Padding Reducido**: Se ajustó a `20px` laterales para maximizar el espacio útil en celulares.
- **Hero**: Columna única, con márgenes verticales ajustados.
- **Header**: Padding más compacto (`12px 20px`).

## 2. Resultado Visual

### Desktop
- La página se siente expansiva y moderna, similar a las landings SaaS de alto nivel (como HeyGen).
- El contenido respira mejor gracias a los márgenes laterales amplios (`72px`).
- Las secciones inferiores (Beneficios, Pasos, etc.) están perfectamente alineadas con el header y el hero.

### Mobile
- Todo el contenido se adapta automáticamente a una columna.
- Los márgenes laterales son seguros para no cortar contenido.

## 3. Verificación
- Abrí `http://localhost:5173/#/` en tu navegador.
- Probá redimensionar la ventana desde pantalla completa hasta tamaño móvil para ver la transición fluida.
