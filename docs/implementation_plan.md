# Implementation Plan - Módulo de Alquileres

Este plan detalla la evolución del módulo de Alquileres para convertirlo en una herramienta integral de administración de propiedades, alineada con las necesidades de una inmobiliaria moderna.

## Objetivo
Transformar la pantalla actual de `Alquileres.tsx` en un módulo completo que permita gestionar el ciclo de vida de los contratos de alquiler, desde la creación hasta la finalización, incluyendo la gestión financiera (cobros, recibos, ajustes) y notificaciones.

## User Review Required
> [!IMPORTANT]
> Se requiere confirmar si la API actual soporta todas las operaciones propuestas (especialmente la generación de recibos PDF y la conexión con Clientes/Propiedades). De no ser así, se simularán las respuestas o se crearán servicios mock en el frontend.

## Propuesta de Funcionalidades

### 1. Dashboard de Alquileres (Mejora Visual)
- **KPIs**: Tarjetas con métricas clave:
  - Total a cobrar vs. Cobrado este mes.
  - Tasa de morosidad.
  - Contratos por vencer (próximos 60 días).
- **Calendario**: Vista rápida de vencimientos de pagos y contratos.

### 2. Gestión de Contratos (Core)
- **Vinculación Real**:
  - Conectar los selectores de "Propiedad", "Locador" y "Locatario" con los módulos de `Propiedades` y `Clientes` existentes.
- **Detalle del Contrato**:
  - Vista detallada con pestañas: "General", "Pagos", "Ajustes", "Documentos".
  - Carga de archivos adjuntos (PDF del contrato firmado, garantías).
- **Ciclo de Vida**:
  - Botones de acción: "Renovar", "Rescindir", "Finalizar".

### 3. Gestión Financiera (Cta Cte)
- **Generación de Períodos**:
  - Lógica para generar automáticamente las cuotas mensuales según la duración del contrato.
- **Registro de Cobros**:
  - Modal de cobro con opciones: Efectivo, Transferencia, Cheque.
  - Soporte para pagos parciales.
- **Recibos**:
  - Generación de comprobante de pago en PDF (descargable/enviable).
- **Liquidaciones**:
  - Generación de liquidación para el propietario (Locador), descontando honorarios de administración.

### 4. Calculadora de Ajustes (ICL / IPC)
- **Integración de Índices**:
  - Implementar la lógica real de cálculo usando índices históricos (mockeados o via API externa si es posible, sino tabla interna).
- **Aplicación de Ajuste**:
  - Botón "Aplicar Ajuste" que actualice el monto base del contrato y regenere las cuotas futuras.

### 5. Notificaciones y Automatización (Ivo-t)
- **Alertas**:
  - Integrar con Ivo-t para enviar recordatorios de vencimiento por WhatsApp/Email (simulado en UI).

## Estructura de Archivos Propuesta

### [MODIFY] `apps/web/src/pages/Alquileres.tsx`
- Refactorizar para usar sub-componentes y mejorar la organización.

### [NEW] `apps/web/src/components/alquileres/`
- `ContractList.tsx`: Tabla de contratos con filtros avanzados.
- `ContractDetail.tsx`: Vista detallada de un contrato.
- `PaymentModal.tsx`: Modal para registrar pagos.
- `AdjustmentCalculator.tsx`: Calculadora de ajustes ICL/IPC.
- `ReceiptGenerator.tsx`: Componente para visualizar/imprimir recibos.

### [NEW] `apps/web/src/services/rentalService.ts`
- Centralizar todas las llamadas a la API de alquileres.

## Verification Plan
### Manual Verification
- **Flujo Completo**: Crear contrato -> Generar cuotas -> Registrar pago -> Ver recibo.
- **Ajustes**: Probar la calculadora con fechas pasadas y verificar el nuevo monto.
- **Navegación**: Verificar vínculos con Propiedades y Clientes.
