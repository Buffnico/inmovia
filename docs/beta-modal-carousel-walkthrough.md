# Walkthrough: Carrusel de Imágenes en Modal Beta

He implementado un carrusel de imágenes automático para el modal de "Beta Cerrada" en la landing page.

## Archivos Modificados
- `apps/web/src/pages/HomeLanding.tsx`:
  - Se agregó la lógica para cargar imágenes dinámicamente desde `src/assets/beta-carousel/` usando `import.meta.glob`.
  - Se implementó un estado `currentImageIndex` y un `useEffect` para rotar las imágenes cada 4 segundos.
  - Se actualizó el JSX del modal para renderizar el carrusel con indicadores (dots) si hay más de una imagen, o la imagen estática original si no hay ninguna o solo una.
- `apps/web/src/styles/HomeLanding.css`:
  - Se añadieron estilos para `.beta-modal-carousel`, `.beta-modal-dots` y `.beta-dot` para controlar la disposición y apariencia del carrusel y sus indicadores.

## Cómo Funciona el Carrusel
1.  **Carga Automática**: El código busca automáticamente cualquier archivo con extensión `.png`, `.jpg`, `.jpeg` o `.webp` dentro de la carpeta `apps/web/src/assets/beta-carousel/`.
2.  **Rotación**: Si hay más de una imagen, estas rotarán automáticamente cada 4 segundos.
3.  **Indicadores**: Aparecen "puntos" debajo de la imagen que muestran cuál se está viendo y permiten saltar a una específica al hacer clic.
4.  **Fallback**: Si la carpeta está vacía, se muestra la imagen original `ivot-working-beta.png` sin romper nada.

## Instrucciones para Agregar Imágenes (Para Nicolás)
Para agregar nuevas fotos de Ivo-t al carrusel, simplemente:
1.  Navegar a la carpeta `apps/web/src/assets/beta-carousel/` (ya creada).
2.  Pegar allí las imágenes deseadas (formatos soportados: PNG, JPG, WEBP).
3.  ¡Listo! Al recargar la página, el carrusel las detectará y mostrará automáticamente.
    *   *Nota: El orden de las imágenes dependerá de sus nombres de archivo (alfabético).*
