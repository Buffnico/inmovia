# Walkthrough: Reversión del Login a Versión Simple

He revertido los cambios visuales del login para volver a la versión simple y limpia, eliminando el header con logo.

## Archivos Modificados
- `apps/web/src/pages/Login.tsx`:
  - Se eliminó la importación del logo `logo-inmovia.png`.
  - Se quitó la estructura `.login-card-header` y el contenedor del logo.
  - Se restauró el título y subtítulo simples (`.login-title` y `.login-subtitle`) dentro de un `div` centrado.
- `apps/web/src/index.css`:
  - Se eliminaron los estilos complejos del header (`.login-card-header`, `.login-logo-mark`, etc.).
  - Se definieron estilos básicos para `.login-title` y `.login-subtitle` (centrados, con márgenes adecuados) para mantener la legibilidad sin elementos extra.

## Estado Actual
- **Pantalla de Login**: Muestra un card blanco centrado en fondo gris.
- **Contenido**: Título "Inmovia Office" y subtítulo "Ingresá a tu oficina digital" en texto plano, seguido del formulario de email/contraseña.
- **Funcionalidad**: Intacta. La lógica de autenticación no se tocó.

## Verificación
- La ruta `/#/login` carga correctamente sin errores visuales ni de JS.
- El diseño es minimalista y funcional, tal como se solicitó.
