# Guía para Preparar Modelos de Documentos (.docx)

Esta guía explica cómo crear y formatear plantillas de Word (.docx) para que funcionen correctamente con el sistema de generación de documentos de Inmovia e Ivo-t.

## 1. Formato Requerido

*   **Tipo de archivo:** Debe ser un documento de Microsoft Word (**`.docx`**).
*   **No soportado:** `.doc` (antiguo), PDF, imágenes, Google Docs (debe descargarse como .docx).
*   **Diseño:** Puede incluir encabezados, pies de página, logos, tablas, negritas, y cualquier formato visual que desee. Inmovia respetará el diseño original.

## 2. ¿Qué es un Placeholder?

Un "placeholder" o variable es una etiqueta especial que le indica a Inmovia dónde debe insertar información automática (como el nombre del cliente, la fecha, etc.).

Se escriben entre **dobles llaves**: `{{nombreVariable}}`

### Placeholders Globales Disponibles

Estos son algunos de los datos que el sistema puede completar automáticamente si están disponibles:

*   `{{nombreCliente}}`: Nombre completo del cliente.
*   `{{dni}}`: DNI o identificación.
*   `{{direccion}}`: Dirección del inmueble o del cliente.
*   `{{monto}}`: Valor de la operación.
*   `{{fecha}}` o `{{fechaHoy}}`: Fecha actual.
*   `{{clausulas_extra}}`: Inserta todas las cláusulas adicionales generadas por Ivo-t en un solo bloque.

### Placeholders para Cláusulas Individuales

Si desea que Ivo-t inserte cláusulas en lugares específicos, use:
*   `{{clausula_1}}`
*   `{{clausula_2}}`
*   `{{clausula_3}}`
*   ... y así sucesivamente.

## 3. Reglas Importantes

1.  **Sin espacios dentro de las llaves:**
    *   Correcto: `{{nombreCliente}}`
    *   Incorrecto: `{{ nombreCliente }}` (No funcionará)
2.  **Sin formato interno:**
    *   Asegúrese de que las llaves y el texto estén en el mismo formato (mismo tipo de letra, sin negritas parciales). Si Word rompe la etiqueta internamente, Inmovia no la reconocerá.
    *   *Tip:* Si falla, borre la etiqueta completa y escríbala de nuevo, o cópiela y péguela desde el Bloc de Notas.

## 4. Convención para Cláusulas (Importante)

Para mantener el estilo jurídico correcto (terminar párrafos con ".-"), siga esta regla:

**El cierre ".-" debe ir FUERA de las llaves del placeholder.**

Inmovia insertará el texto de la cláusula, pero **no** agregará el punto y guion automáticamente. Esto le da control total sobre el formato.

### Ejemplos Correctos:

> **PRIMERA:** El VENDEDOR vende al COMPRADOR... por la suma de `{{monto}}`.-
>
> **SEGUNDA:** `{{clausula_1}}`.-
>
> **TERCERA:** `{{clausula_2}}`.-

### Ejemplo Incorrecto:

> **SEGUNDA:** `{{clausula_1}}` (Falta el punto y guion, quedará abierto si la cláusula no lo trae).

## 5. Líneas y Espacios para Completar

Inmovia **no** genera líneas de puntos (`................`) automáticamente para rellenar espacios vacíos hasta el final del renglón.

Si desea líneas para firmar o espacios visuales:
*   Use **Tablas** con bordes ocultos (excepto el inferior).
*   Use la herramienta de **Borde Inferior** de párrafo.
*   Use **Tabulaciones** con relleno (característica avanzada de Word).

## 6. Ejemplo de Modelo

**Texto en el archivo .docx:**

```text
AUTORIZACIÓN DE VENTA

En la ciudad de Buenos Aires, a los {{fechaHoy}}, el Sr./Sra. {{nombreCliente}}, DNI {{dni}}, autoriza a INMOVIA a ofrecer en venta el inmueble sito en {{direccion}}.-

CONDICIONES:
1) Precio: {{monto}}.-
2) Plazo: {{clausula_1}}.-
3) Honorarios: {{clausula_2}}.-

Firma: __________________________
```

**Resultado final (generado por Inmovia):**

```text
AUTORIZACIÓN DE VENTA

En la ciudad de Buenos Aires, a los 28/11/2025, el Sr./Sra. Juan Pérez, DNI 12.345.678, autoriza a INMOVIA a ofrecer en venta el inmueble sito en Av. Libertador 1000.-

CONDICIONES:
1) Precio: USD 150.000.-
2) Plazo: La presente autorización tendrá una validez de 90 días corridos.-
3) Honorarios: Se pacta una comisión del 3% más IVA a cargo del vendedor.-

Firma: __________________________
```
