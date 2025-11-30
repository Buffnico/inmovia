# Plan Técnico: Sistema de Cláusulas por ID (Fase 2)

Este documento describe la estrategia técnica para implementar la edición granular de cláusulas en una futura iteración de Inmovia.

## Objetivo
Permitir que Ivo-t y el usuario identifiquen, listen y editen cláusulas específicas dentro de un modelo, en lugar de tratar todo el documento como un bloque o usar solo un campo genérico de "cláusulas extra".

## Estrategia de Placeholders
Se estandarizará el uso de placeholders indexados en los modelos .docx:
*   `{{clausula_1}}`
*   `{{clausula_2}}`
*   `{{clausula_3}}`
*   ...

## Cambios Requeridos en Backend

### 1. Metadata en `OfficeModel`
El modelo de datos `OfficeModel` (actualmente en `apps/api/src/models/officeModel.js` y `data/officeModels.json`) deberá extenderse para incluir una definición de cláusulas.

**Nueva estructura propuesta:**
```javascript
{
  id: "model_123",
  name: "Autorización Venta",
  filePath: "...",
  // NUEVO CAMPO
  clauses: [
    { id: "clausula_1", title: "Plazo de Autorización", defaultText: "90 días..." },
    { id: "clausula_2", title: "Honorarios", defaultText: "3% + IVA..." },
    { id: "clausula_3", title: "Exclusividad", defaultText: "..." }
  ]
}
```

### 2. Detección Automática
El endpoint `GET /api/documents/office-models/:id/placeholders` (ya implementado en Fase 1) servirá de base.
En Fase 2, se podría crear un proceso de "Escaneo inicial" que:
1.  Detecte `{{clausula_N}}`.
2.  Sugiera poblar el array `clauses` automáticamente.

## Cambios Requeridos en Frontend / Ivo-t

### 1. Configuración del Modelo
Al crear o editar un modelo en "Oficina modelos", el administrador podrá ver la lista de cláusulas detectadas y asignarles un **Título** amigable (ej: "Precio", "Plazo", "Garantía").

### 2. Interacción con Ivo-t
En el modo `documentModel`, Ivo-t recibirá la metadata de las cláusulas.

**Flujo de Chat:**
1.  Ivo-t: "Este documento tiene las siguientes cláusulas configurables: 1. Plazo, 2. Honorarios. ¿Querés modificar alguna?"
2.  Usuario: "Sí, cambiá la de Honorarios al 4%."
3.  Ivo-t: Identifica que "Honorarios" corresponde a `{{clausula_2}}`.
4.  Ivo-t: Genera el nuevo texto solo para esa variable.
5.  Al llamar a `/generate`, se envía `{ clausula_2: "Texto nuevo..." }`.

## Notas de Implementación
*   No hardcodear lógica de negocio en el backend; dejar que la configuración `clauses` dicte qué variables existen.
*   Mantener la compatibilidad con `{{clausulas_extra}}` como un "catch-all" para texto que no encaja en las cláusulas predefinidas.
