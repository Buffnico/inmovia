# Walkthrough: Implementación del Ícono de Inmovia

He añadido el ícono oficial de Inmovia (`logo-inmovia.png`) en la pantalla de Login y en el Header del Dashboard, utilizando estilos locales para garantizar la estabilidad del diseño.

## Archivos Modificados
- `apps/web/src/pages/Login.tsx`:
  - Se importó el logo.
  - Se añadió un contenedor con el logo encima del título "Inmovia Office".
  - El logo tiene fondo blanco, bordes redondeados y sombra suave, integrándose perfectamente en el card gris.
- `apps/web/src/components/HeaderBar.tsx`:
  - Se reemplazó el texto "IO" por el logo de Inmovia.
  - Se ajustó el tamaño (~32px) para que encaje en la barra de navegación sin alterar su altura.

## Verificación Visual
- **Login**: Al entrar a `/#/login`, verás el logo destacado sobre el formulario.
- **Dashboard**: Al iniciar sesión, la barra superior ahora muestra el logo real a la izquierda, manteniendo el título "Inmovia Office".
- **Estabilidad**: No se tocó `index.css` ni la Sidebar, por lo que el resto de la aplicación (incluyendo la Landing Page) sigue funcionando exactamente igual.
