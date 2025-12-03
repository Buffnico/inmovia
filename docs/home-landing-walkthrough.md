# Walkthrough: Nueva Home Landing de Inmovia (Ivo-t)

He implementado la nueva Landing Page inspirada en HeyGen, enfocada en presentar a Ivo-t como el asistente inteligente de la plataforma.

## 1. Archivos Creados y Modificados

| Archivo | Acción | Descripción |
| :--- | :--- | :--- |
| `apps/web/src/pages/HomeLanding.tsx` | **Creado** | Nuevo componente principal de la Landing. Estructura completa con Hero, Beneficios, Pasos y CTA. |
| `apps/web/src/styles/HomeLanding.css` | **Creado** | Hoja de estilos dedicada para la landing. Diseño limpio, blanco, tipografía grande y responsive. |
| `apps/web/src/router.tsx` | **Modificado** | Se actualizó la ruta raíz `/` para que cargue `HomeLanding` en lugar del `Home` anterior. |
| `apps/web/src/pages/HomeOld.jsx` | **Renombrado** | El archivo `Home.jsx` anterior fue renombrado para preservar el código sin romper nada. |

## 2. Cambios Visuales y de Flujo

- **Ruta `/`**: Ahora muestra la nueva Landing Page pública.
- **Hero Section**: Diseño a dos columnas.
  - **Izquierda**: Título "Desbloqueá tu oficina digital" + Subtítulo Ivo-t + Botones CTA.
  - **Derecha**: Contenedor de video limpio y moderno (sin controles, autoplay).
- **Secciones Nuevas**:
  - **Intro**: Breve explicación de Inmovia + Ivo-t.
  - **Beneficios**: Grid de 4 tarjetas destacando las capacidades de la IA.
  - **Cómo funciona**: 3 pasos simples para empezar.
  - **CTA Final**: Banda azulada invitando a agendar una demo.
- **Navegación**: Header simplificado con Logo y botones de "Iniciar sesión" / "Probar gratis".

## 3. Acciones Requeridas por el Usuario

1. **Archivo de Video**:
   - Asegurate de colocar el archivo de video en la siguiente ruta exacta:
     `apps/web/public/media/ivot-hero-veo3.mp4`
   - Si la carpeta `media` no existe dentro de `public`, creala.

2. **Verificación**:
   - Si el servidor de desarrollo ya estaba corriendo, es posible que se recargue automáticamente. Si no, ejecutá `npm run dev`.
   - Entrá a `http://localhost:5173/` (o el puerto que uses) y deberías ver la nueva landing.
   - Probá redimensionar la ventana para verificar que el diseño se adapta a móvil (columna única).
