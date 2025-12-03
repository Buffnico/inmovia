# Walkthrough: Ajustes Finales HomeLanding (Ancho, Icono y Caption)

He realizado los ajustes solicitados para pulir la landing page, enfocándome en el ancho del hero, la identidad de marca con el icono de Ivo-t y la simulación de diálogo.

## 1. Cambios Realizados

### `apps/web/src/pages/HomeLanding.tsx`
- **Header**: Se reemplazó el logo genérico por la imagen `/assets/ivot-logo.png` junto al texto "Inmovia Office".
- **Hero Media**: Se agregó un párrafo `.home-hero-caption` debajo del video para simular que Ivo-t está hablando ("👋 Hola, soy Ivo-t...").

### `apps/web/src/styles/HomeLanding.css`
- **Ancho del Hero**:
  - Se aumentó el `max-width` a `1280px` (antes 1200px).
  - Se ajustó el grid a `minmax(0, 1.25fr) minmax(0, 1fr)` para dar más peso al texto pero mantener equilibrio.
  - Se aumentó el padding lateral a `40px` y el gap a `64px`.
- **Estilos de Logo**:
  - `.home-logo-icon`: Imagen circular de 32px.
  - `.home-logo-text`: Texto negro semibold.
- **Estilos de Caption**:
  - `.home-hero-caption`: Texto centrado, gris oscuro, ancho limitado para lectura cómoda, ubicado debajo del video.
- **Video Card**:
  - Padding aumentado a `18px` para un marco más robusto.
- **Responsive**:
  - En mobile, el caption ocupa el ancho completo disponible.

## 2. Resultado Visual

### Desktop
- **Header**: Icono de Ivo-t visible y alineado.
- **Hero**: Se siente más "lleno" y profesional gracias al ancho extendido.
- **Video**: Ahora tiene un texto explicativo debajo que humaniza al asistente.

### Mobile
- **Adaptabilidad**: Todo se apila correctamente en una columna, manteniendo la legibilidad del nuevo caption.

## 3. Próximos Pasos
- **Archivo de Imagen**: Recordá copiar tu archivo `ivot-logo.png` a la carpeta `apps/web/public/assets/`.
- **Verificación**: Refrescá `http://localhost:5173/#/` para ver los cambios.
