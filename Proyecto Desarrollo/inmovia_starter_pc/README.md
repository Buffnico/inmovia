# Inmovia – Starter (PC de Escritorio)

## 1) Requisitos
- Node.js LTS
- PNPM
- Git
- Docker Desktop (WSL2)
- VS Code

## 2) Primeros pasos
```bash
cp .env.example .env
docker compose up -d
pnpm i
# API
cd apps/api
pnpm prisma:generate
pnpm prisma:migrate
pnpm dev
# WEB (otra terminal)
cd ../../apps/web
pnpm dev
```
## 3) Servicios
- API: http://localhost:3000/health
- WEB: http://localhost:5173
- MinIO Console: http://localhost:9001
- S3 API MinIO: http://localhost:9000

## 4) Estructura
- apps/api → Backend (Express + Prisma + Zod)
- apps/web → Frontend (React + Vite)
- packages/shared → Schemas (Zod)
- infra/data → Volúmenes de Postgres y MinIO