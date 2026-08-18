# Deploy — Sistema de Pedidos Ropa

> **Estado: DIFERIDO.** La migración a Spring Boot + Vite está completa, pero el deploy
> de producción aún no se define. Este documento marca el stack objetivo y los pasos
> pendientes para cuando se decida publicar.

## Stack objetivo

| Componente | Proveedor propuesto | Notas |
|---|---|---|
| Frontend | Vercel | Estático (`vite build`), root `frontend/` |
| Backend | Render (Docker) | Spring Boot con JVM; definir Dockerfile + render.yaml |
| Base de datos | Neon | PostgreSQL serverless (reemplaza a Supabase) |
| Imágenes | Cloudinary | Ya soportado por el backend (fallback local en dev) |

## Pendiente de definir

1. **Backend en Docker**: crear `Dockerfile` multi-stage con `eclipse-temurin:21-jre`,
   JAR fat, y `render.yaml` con `healthCheckPath: /api` y
   `-XX:MaxRAMPercentage=75` (free tier de Render tiene ~512 MB).
2. **Neon**: crear proyecto y base `ecommerce-ropa`; usar la URL JDBC como `DATABASE_URL`
   (con `?sslmode=require`). Flyway aplica el schema al arranque.
3. **Vercel**: root `frontend/`, build `vite build`, envs `VITE_API_URL` (Render) y
   `VITE_BASE_URL` (Vercel).
4. **Migración de datos (opcional)**: si se quiere conservar el histórico de pedidos de
   la base actual, exportar con `pg_dump` e importar en Neon antes del primer deploy.
5. **Alternativa a futuro**: migrar a servidor propio (la arquitectura es portable:
   un solo JAR + estáticos + PostgreSQL).

## Checklist de verificación post-deploy

- [ ] Catálogo público (`/productos`) carga y pagina
- [ ] Crear pedido → instrucciones de pago → link WhatsApp
- [ ] Login admin (`/admin/login`) y dashboard
- [ ] Confirmar/cancelar pedido (stock)
- [ ] Exportar CSV
- [ ] Upload de imágenes (Cloudinary en prod)
- [ ] Swagger en `/api`
- [ ] CORS: `FRONTEND_URL` debe coincidir exactamente con la URL de Vercel

## CI

`.github/workflows/ci.yml`: `mvn verify` (backend con servicio PostgreSQL) +
`vitest` + `vite build` (frontend) en cada push/PR a `main`.
