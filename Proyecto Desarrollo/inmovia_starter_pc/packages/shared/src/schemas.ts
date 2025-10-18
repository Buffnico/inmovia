import { z } from 'zod'

export const DocumentType = z.enum(['RESERVA','REFUERZO','RECIBO','ENTREGA_LLAVES','ENTREGA_DOC'])

export const CreateDocumentInput = z.object({
  tipo: DocumentType,
  clienteNombre: z.string().min(2),
  propiedadId: z.string().uuid(),
  agenteId: z.string().uuid(),
  monto: z.number().positive(),
})
export type CreateDocumentInput = z.infer<typeof CreateDocumentInput>