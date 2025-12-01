# Walkthrough: Nuevo Documento desde Modelos de Oficina

## Archivos Modificados
*   `apps/web/src/pages/Documentos.tsx`:
    *   Se renombró el botón "Nuevo Contrato" a "Nuevo Documento".
    *   Se implementó la lógica para abrir el modal de selección de modelos.
    *   Se integró el flujo hacia el `UseOfficeModelWizard`.
*   `apps/web/src/components/SelectOfficeModelModal.tsx` (Nuevo):
    *   Componente modal para listar y filtrar modelos de oficina disponibles.

## Confirmación de Cambios
1.  **Botón Renombrado**: En la sección de herramientas rápidas de Documentos, el primer botón ahora dice **"Nuevo Documento"**.
2.  **Modal de Selección**: Al hacer clic, se abre un modal "Elegir modelo de documento" que lista los modelos cargados en el sistema.
3.  **Integración con Wizard**: Al seleccionar un modelo y dar clic en "Usar", se cierra el selector y se abre inmediatamente el **Asistente de Generación de Documentos** (Wizard) pre-cargado con el modelo elegido.
4.  **Aislamiento**: No se realizaron cambios en el módulo de Alquileres ni en la lógica interna del Wizard, garantizando que las funcionalidades existentes (y el módulo de Alquileres) permanezcan intactas.

## Prueba Manual
1.  Navegar a **Documentos**.
2.  Hacer clic en el botón **"Nuevo Documento"** (icono azul 📄).
3.  Verificar que aparece el modal con la lista de modelos.
4.  Usar el buscador para filtrar (si hay muchos modelos).
5.  Clic en **"Usar"** en uno de los modelos.
6.  Verificar que se abre el wizard "Usar Modelo: [Nombre del Modelo]".
7.  Completar el wizard y generar el documento para confirmar el flujo completo.
