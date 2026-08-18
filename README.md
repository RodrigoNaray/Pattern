# Pattern 

![Java](https://img.shields.io/badge/Java%2021-ED8B00?logo=openjdk&logoColor=fff)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?logo=springboot&logoColor=fff)
![React](https://img.shields.io/badge/React%2019-61DAFB?logo=react&logoColor=000)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=fff)
![Tests](https://img.shields.io/badge/tests-156%20passing-brightgreen)

Aplicación web completa para la gestión de una tienda de ropa online. Permite a los visitantes explorar un catálogo, agregar productos al carrito y realizar pedidos con pago por transferencia bancaria. Los administradores gestionan productos, confirman pagos y administran la tienda desde un panel privado.

**Stack**: Spring Boot 3 + JPA/Hibernate + Flyway + PostgreSQL (backend) · Vite + React 19 + TypeScript + react-router (frontend)

> Migrada desde NestJS + Prisma + Next.js. La API pública y el schema de base de datos se mantienen idénticos.

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
- Cancelar pedidos
- Ver y gestionar notificaciones (EMAIL y PANEL)
- Configurar datos de la tienda (banco, WhatsApp, etc.)

---

## Arquitectura

```
sistema-pedidos-ropa/
├── backend/          # API REST (Spring Boot + Maven)
│   ├── src/main/java/com/sistemapedidos/
│   │   ├── common/       # config, errores NestJS-shape
│   │   ├── security/     # Spring Security + JWT + BCrypt
│   │   ├── domain/       # entidades JPA + repositorios
│   │   ├── modules/      # auth, producto, pedido, carrito, configuracion, notificacion
│   │   └── seed/         # DataSeeder (admin + config + productos)
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/ # Flyway (V1 = schema de Prisma)
│   └── src/test/         # Tests JUnit + MockMvc (82)
├── frontend/         # UI (Vite + React 19 + react-router)
│   ├── src/
│   │   ├── pages/        # Rutas (public + admin)
│   │   ├── components/   # Componentes React
│   │   ├── services/     # Clientes API (Result pattern)
│   │   └── hooks/ lib/ types/ styles/
│   └── src/__tests__/    # Tests Vitest (74)
└── documentacion/    # ADRs, casos de uso, diagramas
```

---

## Stack tecnológico

| Tecnología | Uso |
|---|---|
| **Java 21 + Spring Boot 3.5** | API REST modular |
| **JPA/Hibernate + Flyway** | ORM sobre schema fijo + migraciones |
| **PostgreSQL** | Base de datos relacional (enums nativos, arrays) |
| **Spring Security + jjwt + BCrypt** | Autenticación JWT de administradores |
| **springdoc (Swagger)** | Documentación de API en `/api` |
| **Vite 7 + React 19** | SPA con TypeScript estricto |
| **React Router v7** | Routing + guard `RequireAuth` |
| **Framer Motion** | Animaciones sutiles |
| **CSS Modules** | Estilos encapsulados (sin Tailwind) |
| **JUnit / Vitest** | Tests unitarios e integración |

---

## Requisitos

- **JDK** >= 21
- **Maven** >= 3.9
- **Node.js** >= 20
- **pnpm** >= 8
- **PostgreSQL** >= 14

## Instalación y configuración

```bash
# 1. Clonar el repositorio
git clone https://github.com/RodrigoNaray/sistema-pedidos-ropa.git
cd sistema-pedidos-ropa

# 2. Backend: configurar variables de entorno
cd backend
cp .env.example .env
# Editar DATABASE_URL / DATABASE_USERNAME / DATABASE_PASSWORD (y opcional JWT_SECRET, CLOUDINARY_*)

# 3. Crear la base de datos en PostgreSQL
createdb ecommerce-ropa

# 4. Iniciar el backend (Flyway crea el schema y DataSeeder siembra datos)
mvn spring-boot:run        # http://localhost:8080

# 5. Frontend
cd ../frontend
cp .env.example .env       # VITE_API_URL=http://localhost:8080
pnpm install
pnpm dev                   # http://localhost:5173
```

### Credenciales iniciales

- **Email**: `admin@tienda.com`
- **Contraseña**: `admin123`

---

## Deploy en producción

**Pendiente de definir** (ver [DEPLOY.md](./DEPLOY.md)). Objetivo: Vercel (frontend estático) + Render (backend Spring en Docker) + Neon (PostgreSQL) + Cloudinary (imágenes).

---

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción | Obligatorio |
|---|---|---|
| `DATABASE_URL` | URL JDBC de conexión a PostgreSQL | Sí |
| `DATABASE_USERNAME` | Usuario de la base | Sí |
| `DATABASE_PASSWORD` | Contraseña de la base | Sí |
| `JWT_SECRET` | Secreto para firmar tokens JWT | Sí |
| `JWT_EXPIRES_IN` | Duración del token (ej. `24h`, `7d`) | No |
| `PORT` | Puerto del servidor (default `8080`) | No |
| `WHATSAPP_NUMBER` | Número de WhatsApp del dueño | No |
| `API_URL` | URL pública del backend (para imágenes locales) | Solo producción |
| `FRONTEND_URL` | URL del frontend (para CORS) | Solo producción |
| `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` | Cloudinary | Solo Cloudinary |
| `APP_SEED_ENABLED` | Siembra inicial de datos (default `true`) | No |

### Frontend (`frontend/.env`)

| Variable | Descripción | Default |
|---|---|---|
| `VITE_API_URL` | URL de la API backend | `http://localhost:8080` |
| `VITE_BASE_URL` | URL base del frontend (para Open Graph) | `http://localhost:5173` |

---

## Scripts útiles

```bash
# Backend (desde backend/)
mvn spring-boot:run   # Servidor en modo desarrollo
mvn test              # Tests (requiere BD ecommerce-ropa-test)
mvn package -DskipTests

# Frontend (desde frontend/ o con pnpm)
pnpm --filter frontend dev          # Servidor de desarrollo
pnpm --filter frontend build        # tsc + vite build
pnpm --filter frontend test         # Tests

# Ambos simultáneamente
pnpm dev
```

---

## Documentación de la API

Con el backend corriendo, la documentación Swagger está disponible en:

[http://localhost:8080/api](http://localhost:8080/api)

Incluye todos los endpoints, esquemas DTO y autenticación Bearer.

---

## Licencia

MIT
