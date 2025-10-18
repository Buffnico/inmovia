import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors({ origin: process.env.API_ORIGIN || '*' }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

const CreateDocSchema = z.object({
  tipo: z.string().min(2),
  clienteNombre: z.string().min(2),
  propiedadId: z.string().uuid(),
  agenteId: z.string().uuid(),
  monto: z.number().positive(),
});

app.post('/documents', async (req, res) => {
  const parsed = CreateDocSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = parsed.data;
  const doc = await prisma.documento.create({ data: {
    tipo: data.tipo,
    clienteNombre: data.clienteNombre,
    propiedadId: data.propiedadId,
    agenteId: data.agenteId,
    monto: data.monto,
  }});
  res.status(201).json(doc);
});

const port = Number(process.env.API_PORT || 3000);
app.listen(port, () => console.log(`[API] Inmovia escuchando en puerto ${port}`));