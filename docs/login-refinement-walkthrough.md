# Walkthrough: Refinamiento Visual del Login

He actualizado la pantalla de login para que tenga un aspecto más "SaaS Premium" y utilice el logo real de Inmovia.

## Archivos Modificados
- `apps/web/src/pages/Login.tsx`:
  - Se importó el logo desde `../assets/logo-inmovia.png`.
  - Se reemplazó el título simple por un header estructurado (`.login-card-header`) que incluye el logo y el texto alineados.
- `apps/web/src/index.css`:
  - Se agregaron los estilos para `.login-card-header`, `.login-logo-mark`, `.login-title`, etc.

## Cambios Visuales
- **Header del Card**:
  - Ahora muestra el logo de Inmovia dentro de un recuadro con gradiente azul y sombra suave (`box-shadow`), dándole profundidad.
  - El título "Inmovia Office" y el subtítulo "Ingresá a tu oficina digital" están alineados a la derecha del logo.
- **Estilo General**:
  - Se mantiene el card blanco centrado sobre fondo gris, pero el nuevo header eleva la percepción de calidad de la interfaz.
  - La tipografía y espaciados se ajustaron para ser más consistentes con el resto de la aplicación.

## Nota
- La lógica de autenticación (`handleLogin`, `AuthService`, etc.) **no se tocó** y sigue funcionando exactamente igual.
- Si el archivo del logo no existe aún, el espacio está reservado y listo para cuando se agregue.
