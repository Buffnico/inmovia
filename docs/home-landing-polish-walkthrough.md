# Walkthrough: Pulido de HomeLanding (Estilo HeyGen)

He actualizado la landing page para alinearla con el diseño de HeyGen, mejorando el header y el hero section.

## 1. Cambios Realizados

### `apps/web/src/pages/HomeLanding.tsx`
- **Header**: Se reemplazó el navbar simple por un header completo con:
  - Logo a la izquierda.
  - Menú de navegación central (Plataforma, Casos de uso, etc.).
  - Botones de acción a la derecha ("Iniciar sesión", "Probar gratis").
- **Hero**: Se reestructuró para usar un grid de 2 columnas más balanceado.
  - Texto a la izquierda con tipografía más grande.
  - "Card" de video a la derecha con sombra y bordes redondeados.

### `apps/web/src/styles/HomeLanding.css`
- **Header Styles**: Nuevo CSS para `.home-header` sticky, con borde inferior sutil y distribución flex.
- **Hero Styles**:
  - `.home-hero-inner`: Grid layout con `minmax` para mejor distribución del espacio.
  - Tipografía ajustada: Títulos más grandes (48px), colores específicos (`#2563eb` para acentos).
  - **Video Card**: `.home-hero-card` con `box-shadow` pronunciada y `border-radius` de 32px.
- **Responsive**:
  - En pantallas menores a 900px, el menú central se oculta.
  - El hero pasa a una sola columna centrada.

## 2. Resultado Visual

### Desktop (> 900px)
- **Header**: Barra blanca fija arriba, menú limpio en el centro.
- **Hero**:
  - Izquierda: Título "Desbloqueá tu oficina digital" en grande.
  - Derecha: Video de Ivo-t dentro de una tarjeta flotante elegante.
  - Espaciado: `max-width: 1200px` centrado, aprovechando mejor el ancho de pantalla.

### Mobile (< 900px)
- **Header**: Solo muestra Logo y Botones (menú oculto para limpieza).
- **Hero**: Columna única. Texto centrado arriba, video debajo.
- **Orden**: Se mantiene la legibilidad y los botones de acción son accesibles.

## 3. Verificación
Podés verificar los cambios en `http://localhost:5173/#/`.
- El header debe quedarse fijo al scrollear.
- El video debe tener una sombra suave y esquinas redondeadas.
- Al achicar la ventana, el diseño debe adaptarse fluidamente a una columna.
