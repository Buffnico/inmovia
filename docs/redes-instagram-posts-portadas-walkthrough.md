# Redes Instagram: Editor de Post + Generador de Portadas

Este documento detalla la implementación de las nuevas herramientas visuales en el módulo de Redes (Instagram) de Inmovia.

## Resumen
Se han transformado las pestañas de **Publicaciones** y **Portadas** en herramientas de edición con vista previa en tiempo real. Ahora los agentes pueden crear contenido visual para Instagram directamente desde Inmovia, utilizando datos simulados de propiedades.

## Archivos Modificados
- `apps/web/src/pages/RedesInstagramPosts.tsx`: Nuevo editor de posts con vista previa de celular.
- `apps/web/src/pages/RedesInstagramPortadas.tsx`: Nuevo generador de Stories con plantillas.
- `apps/web/src/pages/RedesInstagram.css`: Estilos para el layout de herramientas, previews y plantillas.
- `apps/web/src/services/instagramService.ts`: Añadidos mocks de propiedades (`getMockProperties`).

## Flujo: Creador de Post (Publicaciones)
1.  **Selección de Propiedad**: El usuario elige una propiedad del listado (mock).
2.  **Configuración**:
    *   **Tipo de Post**: Clásico, Carrusel o Reel.
    *   **Datos Visibles**: Checkboxes para mostrar/ocultar precio, ubicación y características en la imagen (overlay visual).
    *   **Etiqueta**: Texto corto como "Nuevo Ingreso".
3.  **Descripción (Caption)**:
    *   Se genera un texto base automático con los datos de la propiedad.
    *   **Botón "✨ Sugerir con Ivo-t"**: Genera variaciones creativas del texto usando templates predefinidos (simulación de IA).
4.  **Vista Previa**: A la derecha se ve cómo quedaría el post en el feed de Instagram.
5.  **Acciones**:
    *   "Guardar borrador": Simula el guardado en Inmovia.
    *   "Copiar texto": Copia el caption al portapapeles para pegarlo en Instagram.

## Flujo: Generador de Stories (Portadas)
1.  **Selección de Propiedad**: Elige la propiedad a promocionar.
2.  **Diseño / Plantilla**:
    *   **Minimalista**: Diseño limpio con degradado inferior.
    *   **Elegante**: Diseño con degradado lateral.
    *   **Impacto**: Diseño con textos grandes y etiquetas rotadas.
3.  **Personalización**: Activa/desactiva precio, título y ubicación.
4.  **Vista Previa**: A la derecha se ve la Story en formato 9:16.
5.  **Descarga**: El botón "⬇ Descargar portada" simula la generación de la imagen final (listo para integrar con librerías como `html2canvas`).

## Cómo Probar
1.  Ir a la pestaña **Redes** -> **Publicaciones**.
2.  Cambiar de propiedad y ver cómo se actualiza la foto y el texto.
3.  Probar el botón "Sugerir con Ivo-t" para ver diferentes descripciones.
4.  Ir a la pestaña **Portadas**.
5.  Cambiar entre plantillas (Minimalista, Elegante, Impacto) y ver los cambios de estilo en la preview derecha.
6.  Verificar que el layout es responsive (en móvil, el editor aparece arriba y la preview abajo).

## Notas Técnicas
-   Todo el módulo funciona con datos mock (`instagramService.ts`), sin llamadas al backend.
-   No se han agregado nuevas dependencias npm.
-   El diseño respeta el sistema de estilos de Inmovia y las variables CSS existentes.
