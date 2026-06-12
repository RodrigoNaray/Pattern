# Pattern 

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=fff)
![Next.js](https://img.shields.io/badge/Next.js-000?logo=next.js&logoColor=fff)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=fff)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=fff)

Aplicación web completa para la gestión de una tienda de ropa online. Permite a los visitantes explorar un catálogo, agregar productos al carrito y realizar pedidos con pago por transferencia bancaria. Los administradores gestionan productos, confirman pagos y administran la tienda desde un panel privado.

**Stack**: NestJS + Prisma + PostgreSQL (backend) · Next.js 16 + React 19 + TypeScript (frontend)

---

## Funcionalidades

### Visitante (público)
- Navegar catálogo de productos con filtros y paginación
- Ver detalle de producto con galería de imágenes
- Agregar productos al carrito
- Crear pedido con datos de contacto (email y teléfono)
- Ver instrucciones de pago por transferencia bancaria
- Enviar comprobante por WhatsApp al dueño

### Administrador (panel privado)
- Iniciar sesión con JWT
- Dashboard con resumen de pedidos, productos y notificaciones
- Publicar, editar y desactivar productos (con imágenes)
- Ver pedidos pendientes de pago
- Confirmar pago manualmente (descuenta stock automáticamente)
- Cancelar pedidos (restaura stock)
- Ver y gestionar notificaciones (EMAIL y PANEL)
- Configurar datos de la tienda (banco, WhatsApp, etc.)

---

## Arquitectura

```
sistema-pedidos-ropa/
├── backend/          # API REST (NestJS + Prisma)
│   ├── src/
│   │   ├── modules/  # auth, producto, pedido, carrito, configuracion, notificacion
│   │   ├── common/   # DatabaseModule, PrismaService
│   │   └── main.ts   # Bootstrap (ValidationPipe, Swagger, CORS)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── test/         # Tests unitarios (Jest)
├── frontend/         # UI (Next.js 16 App Router)
│   ├── src/
│   │   ├── app/      # Páginas y layouts
│   │   ├── components/  # Componentes React
│   │   ├── services/    # Clientes API (Result pattern)
│   │   └── types/       # Tipos compartidos
│   └── vitest.config.ts  # Configuración de tests
└── documentacion/    # ADRs, casos de uso, diagramas
```

---

## Stack tecnológico

| Tecnología | Uso |
|---|---|
| **TypeScript** | Tipado estricto en todo el proyecto |
| **NestJS 11** | API REST modular con inyección de dependencias |
| **Prisma 5** | ORM type-safe con migraciones |
| **PostgreSQL** | Base de datos relacional |
| **Next.js 16** | App Router, Server Components, React 19 |
| **Radix UI** | Componentes interactivos accesibles |
| **Framer Motion** | Animaciones sutiles |
| **CSS Modules** | Estilos encapsulados (sin Tailwind) |
| **Passport + JWT** | Autenticación de administradores |
| **Swagger** | Documentación de API en `/api` |
| **Jest / Vitest** | Tests unitarios |

---

## Requisitos

- **Node.js** >= 18
- **pnpm** >= 8
- **PostgreSQL** >= 14

## Instalación y configuración

```bash
# 1. Clonar el repositorio
git clone https://github.com/RodrigoNaray/sistema-pedidos-ropa.git
cd sistema-pedidos-ropa

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con tus credenciales de PostgreSQL

# 4. Crear la base de datos en PostgreSQL
createdb tienda_ropa

# 5. Ejecutar migraciones
pnpm --filter backend prisma:migrate

# 6. Poblar la base de datos con datos iniciales
pnpm --filter backend seed

# 7. Iniciar el proyecto (backend + frontend)
pnpm dev
```

La API estará disponible en `http://localhost:3000` y el frontend en `http://localhost:3000`.

### Credenciales iniciales

- **Email**: `admin@tienda.com`
- **Contraseña**: `admin123`

---

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | URL de conexión a PostgreSQL |
| `JWT_SECRET` | Secreto para firmar tokens JWT |
| `JWT_EXPIRES_IN` | Duración del token (ej. `7d`) |
| `WHATSAPP_NUMBER` | Número de WhatsApp del dueño |
| `EMAIL_FROM` | Dirección de email remitente |
| `EMAIL_PASSWORD` | Contraseña del email |

### Frontend (`frontend/.env`)

| Variable | Descripción | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL de la API backend | `http://localhost:3000` |

---

## Scripts útiles

```bash
# Backend
pnpm --filter backend start:dev    # Servidor en modo desarrollo
pnpm --filter backend prisma:studio  # Explorador de base de datos
pnpm --filter backend test          # Ejecutar tests

# Frontend
pnpm --filter frontend dev          # Servidor de desarrollo
pnpm --filter frontend build        # Build de producción
pnpm --filter frontend lint         # Linter
pnpm --filter frontend test         # Tests

# Ambos simultáneamente
pnpm dev
```

---

## Documentación de la API

Con el backend corriendo, la documentación Swagger está disponible en:

[http://localhost:3000/api](http://localhost:3000/api)

Incluye todos los endpoints, esquemas DTO y autenticación Bearer.

---

## Licencia

MIT
