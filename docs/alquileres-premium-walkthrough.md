# Walkthrough: Rediseño Premium del Módulo Alquileres

Este documento detalla el rediseño del módulo de Alquileres de Inmovia Office, transformándolo en un panel de gestión financiera profesional.

## Estructura del Módulo

El módulo se ha reorganizado en 5 pestañas principales para mejorar la usabilidad y la presentación comercial:

### 1. Resumen (Overview)
- **KPI Cards**: Métricas clave en la parte superior (Contratos Activos, Próximos a Vencer, Cobros del Mes, Pagos Atrasados).
- **Cobros Recientes**: Tabla rápida con los últimos pagos registrados.
- **Próximos Vencimientos**: Lista de alertas para contratos que vencen en los próximos 60 días.

### 2. Contratos
- **Layout Dividido**: Lista de contratos a la izquierda, detalle completo a la derecha.
- **Modo de Gestión**: Nuevo selector visual para definir si un contrato es "Solo Contrato" (archivo documental) o "Seguimiento de Pagos" (gestión financiera activa).
- **Detalle**: Información enriquecida con datos del locador, locatario y zona de archivo digital.

### 3. Pagos & Recibos
- **Selector de Contrato**: Dropdown para elegir el contrato a gestionar.
- **Grilla de Pagos**: Visualización de los meses como "chips" con estado (Pagado, Pendiente, Atrasado).
- **Gestión de Recibos**: Panel lateral (mock) para generar recibos y activar recordatorios automáticos.

### 4. Calculadora (Demo)
- **Herramienta de Ajuste**: Formulario para simular actualizaciones de alquileres.
- **Índices Soportados**: ICL, IPC, UVA (simulados en frontend).
- **Integración Futura**: Mención clara a la integración con "ArgenStats" en el backend para datos reales.

### 5. Configuración
- **Preferencias**: Explicación de los modos de gestión y la integración de índices.
- **Automatización**: Maqueta de la futura integración con el módulo de Propiedades (atajo al reservar).

## Datos y Estado
- **Contratos y Pagos**: Se consumen de la API existente (`/api/alquileres/contratos`, `/api/alquileres/pagos`).
- **Datos Mock**: Para la demo, se enriquecen los contratos con datos ficticios como direcciones, nombres de locadores y el modo de gestión.
- **Calculadora**: Funciona con lógica puramente frontend para demostración.

## Guía para Demo Comercial
1.  **Inicio**: Mostrar el tab "Resumen" para destacar la claridad financiera.
2.  **Gestión**: Ir a "Contratos", seleccionar uno y mostrar el toggle de "Seguimiento de Pagos" para explicar la flexibilidad del sistema.
3.  **Cobranza**: Ir a "Pagos", mostrar lo fácil que es ver el estado de cuenta y mencionar la generación de recibos.
4.  **Valor Agregado**: Mostrar la "Calculadora" como una herramienta potente para el día a día del martillero.
