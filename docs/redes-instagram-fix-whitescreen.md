# Solución Pantalla en Blanco - Redes Instagram

Este documento detalla la solución implementada para corregir el error de "pantalla en blanco" en el módulo de Redes (Instagram Demo).

## Causa Raíz
El problema se debía a una combinación de factores:
1.  **Errores de Runtime**: Posibles fallos al cargar datos iniciales o al renderizar componentes con props indefinidas.
2.  **Dependencia de API**: El servicio `instagramService.ts` intentaba hacer llamadas a la API real (que podía fallar o no estar configurada), causando excepciones no controladas.
3.  **Falta de Manejo de Errores**: No existía un `ErrorBoundary` que capturara estos fallos, por lo que cualquier excepción rompía todo el árbol de componentes de React.

## Cambios Realizados

### 1. `apps/web/src/pages/Redes.tsx`
-   **ErrorBoundary**: Se implementó un componente `RedesErrorBoundary` que envuelve todo el contenido del módulo. Si ocurre un error, muestra un mensaje amigable y un botón para recargar, en lugar de una pantalla blanca.
-   **Robustez en Carga de Cuentas**: Se mejoró la función `loadAccounts` para asegurar que siempre se trabaje con un array (incluso si la respuesta es nula o indefinida) y se agregaron logs para depuración.
-   **Validación de Renderizado**: Se agregaron chequeos adicionales para evitar renderizar sub-componentes si no hay una cuenta seleccionada válida.

### 2. `apps/web/src/services/instagramService.ts`
-   **Mocks Puros**: Se eliminaron las llamadas a `fetch` que dependían del backend. Ahora todas las funciones (`getMyInstagramAccounts`, `getFeedPosts`, etc.) retornan promesas que se resuelven con datos simulados (mocks) después de un pequeño delay.
-   **Seguridad**: Esto garantiza que el frontend nunca falle por problemas de red o de configuración del backend durante la demo.

## Cómo Probar el Módulo

1.  **Navegación**: Ir a la pestaña **Redes** en el menú lateral.
2.  **Verificación Visual**: La pantalla debe cargar correctamente (no blanca). Debería verse el header "Redes – Instagram".
3.  **Interacción**:
    -   Cambiar entre las pestañas: Publicaciones, Comentarios, Mensajes, Portadas, Configuración.
    -   En **Configuración**, verificar que aparecen las cuentas "Personal" y "Oficina" (simuladas).
    -   En **Mensajes**, abrir un chat y enviar un mensaje de prueba (se agregará localmente).
    -   En **Portadas**, generar una imagen de prueba.
4.  **Prueba de Error (Opcional)**: Si algo fallara internamente, ahora verías un panel con el mensaje "⚠️ Error cargando Redes" en lugar de la pantalla blanca.

## Estado Final
El módulo es ahora un **Demo 100% Frontend** robusto, ideal para presentaciones, sin dependencias externas que puedan causar inestabilidad.
