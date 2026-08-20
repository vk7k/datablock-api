# 📊 DataBlock API - Polymorphic Block Management Backend

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![JWT](https://img.shields.io/badge/Auth-JWT%20Bearer-000000?style=flat&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Resend](https://img.shields.io/badge/Email-Resend-black?style=flat&logo=resend&logoColor=white)](https://resend.com/)

A high-performance, polymorphic RESTful API built with **Node.js**, **Express**, **MySQL**, and **Prisma ORM**. Designed to power modern client-side Gantt charts, Work Breakdown Structures (WBS), project roadmaps, and nested data management systems.

The core architecture utilizes **Single Table Inheritance (STI)** with a self-referencing relationship and dynamic JSON `payload` column to seamlessly organize diverse entities (`PROJECT`, `STAGE`, `TASK`, `ASSET`, `CONTRACT`, etc.) into an arbitrary-depth tree hierarchy.

---

## 🚀 Key Highlights & Features

- **Polymorphic Single Table Inheritance (STI)**:
  - Unified `blocks` table self-referencing via `parent_id -> blocks.id`.
  - Supports infinite hierarchy nesting and automated cascade deletions.
- **High-Efficiency $O(N)$ Tree Builder**:
  - `GET /api/blocks/tree` converts relational records into nested hierarchical JSON trees in linear time, perfectly optimized for Gantt charts and tree grids.
- **Dynamic JSON Payloads & Shallow Merging**:
  - Flexible `payload` JSON field for arbitrary metadata, Gantt coordinates, custom fields, dependencies, and assignees.
  - Updates via `PUT /api/blocks/:id` intelligently merge new payload fields with existing metadata.
- **Secure Authentication & RBAC**:
  - JWT (JSON Web Token) authentication with bearer headers.
  - Salted bcrypt password hashing.
  - Password reset workflows with secure, time-limited reset tokens.
- **Multi-Provider Transactional Email Service**:
  - **Primary**: Resend REST API (`RESEND_API_KEY`).
  - **Fallback**: Generic SMTP transport (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`).
  - **Development Mode**: Safe fallback to formatted console logging.
- **Interactive Web Studio App (`/` o `/app`)**:
  - Interfaz visual SPA moderna integrada para gestión CRUD completa de bloques sin dependencias externas.
  - **Vista en Árbol Jerárquico**: Visualización de nodos anidados (Gantt-ready), expansión/contracción, creación de hijos directa y previsualización de payloads.
  - **Vista de Tabla con Filtros Múltiples**: Búsqueda por texto, tipo, estado y versión de esquema (`schema_version`).
  - **Gestor de Relaciones (Parent Selector)**: Re-asignación de nodos padres y prevención de ciclos en el árbol.
  - **Gestor de Tipos y Plantillas Personalizadas**: Creación de tipos de bloques propios con plantillas JSON precargadas.
  - **Editor de Payloads**: Editor en vivo con formateador y validación de sintaxis JSON en tiempo real.
- **Input Validation & Error Handling**:
  - Strict schema validations via **Zod** middleware.
  - Centralized error handler with standardized JSON response envelopes.
- **Cloud-Ready for Render.com**:
  - Automated schema migration with `npx prisma db push` during build.
  - Pre-configured `render.yaml` blueprint with environment variable definitions.

---

## 🏛️ System Architecture & Directory Structure

```text
datablock-api/
├── prisma/
│   ├── schema.prisma              # Prisma schema (User & Block models, self-referencing relation)
│   └── seed.js                    # Database seeder with realistic hierarchical Gantt tree
├── src/
│   ├── config/
│   │   ├── env.js                 # Environment configuration & Zod schema validation
│   │   ├── prisma.js              # Prisma Client singleton
│   │   └── mailer.js              # Resend + Nodemailer SMTP + Dev console fallback transport
│   ├── controllers/
│   │   ├── auth.controller.js     # Register, Login, Forgot & Reset Password
│   │   ├── block.controller.js    # Polymorphic Block CRUD & Tree endpoints
│   │   └── user.controller.js     # User profile retrieval and management
│   ├── middlewares/
│   │   ├── auth.middleware.js     # JWT Bearer token authentication & role verification
│   │   ├── error.middleware.js    # Global 404 and 500 error handlers
│   │   └── validate.middleware.js # Zod request body validation middleware
│   ├── routes/
│   │   ├── auth.routes.js         # /api/auth routes
│   │   ├── block.routes.js        # /api/blocks routes
│   │   ├── user.routes.js         # /api/users routes
│   │   └── index.js               # Master API router
│   ├── services/
│   │   ├── auth.service.js        # Authentication business logic & password tokens
│   │   ├── block.service.js       # STI Block queries, payload merging & tree creation
│   │   ├── mail.service.js        # Welcome and password recovery emails
│   │   └── user.service.js        # User database operations
│   ├── utils/
│   │   ├── jwt.util.js            # JWT signing and verification utilities
│   │   ├── response.util.js       # Standardized response envelopes (success/error)
│   │   └── tree.util.js           # O(N) relational to tree structure converter
│   ├── validators/
│   │   ├── auth.validator.js      # Auth request validation schemas
│   │   ├── block.validator.js     # Block request validation schemas
│   │   └── user.validator.js      # User request validation schemas
│   ├── app.js                     # Express application setup, CORS, JSON parsing
│   └── server.js                  # HTTP server listener and graceful shutdown
├── tests/
│   └── api.test.js                # Integrated test suite for validators, tree builder & auth
├── .env.example                   # Template for environment configuration
├── .gitignore                     # Git exclusions (credentials, logs, node_modules)
├── package.json                   # Dependencies and scripts
├── render.yaml                    # Render Blueprint deployment definition
└── README.md                      # Complete project documentation
```

---

## 🗄️ Database Schema Overview

```prisma
model User {
  id                 String    @id @default(uuid()) @db.VarChar(36)
  email              String    @unique @db.VarChar(255)
  password_hash      String    @map("password_hash") @db.VarChar(255)
  role               String    @default("user") @db.VarChar(50)
  reset_token        String?   @map("reset_token") @db.VarChar(255)
  reset_token_expiry DateTime? @map("reset_token_expiry")
  created_at         DateTime  @default(now()) @map("created_at")
  updated_at         DateTime  @updatedAt @map("updated_at")

  @@map("users")
}

model Block {
  id             String    @id @default(uuid()) @db.VarChar(36)
  parent_id      String?   @map("parent_id") @db.VarChar(36)
  name           String    @db.VarChar(255)
  start_date     DateTime  @map("start_date")
  end_date       DateTime  @map("end_date")
  status         String    @default("pending") @db.VarChar(50)
  type           String    @db.VarChar(50)
  schema_version Int       @default(1) @map("schema_version")
  payload        Json?     @db.Json
  created_at     DateTime  @default(now()) @map("created_at")
  updated_at     DateTime  @updatedAt @map("updated_at")

  parent   Block?  @relation("BlockHierarchy", fields: [parent_id], references: [id], onDelete: Cascade)
  children Block[] @relation("BlockHierarchy")

  @@index([parent_id])
  @@index([type])
  @@index([status])
  @@index([schema_version])
  @@map("blocks")
}
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root based on [`.env.example`](.env.example):

```bash
cp .env.example .env
```

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Listening HTTP Port | `3000` |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` |
| `APP_URL` | Base server URL | `http://localhost:3000` |
| `FRONTEND_URL` | Allowed client URL for CORS & password reset links | `http://localhost:5173` |
| `DATABASE_URL` | MySQL Connection URI (requires SSL parameter for cloud DBs) | `mysql://user:pass@host:3306/db?sslaccept=strict` |
| `JWT_SECRET` | Secret key for JWT signing | `super_secret_jwt_key_here` |
| `JWT_EXPIRES_IN` | JWT token validity window | `7d` |
| `RESEND_API_KEY` | *(Optional)* Resend API Key for transactional emails | `re_123456789...` |
| `MAIL_FROM` | Default sender email address | `UXC Manager <onboarding@resend.dev>` |
| `SMTP_HOST` | *(Optional)* Generic SMTP host fallback | `smtp.mailgun.org` |
| `SMTP_PORT` | *(Optional)* Generic SMTP port fallback | `587` |
| `SMTP_USER` | *(Optional)* Generic SMTP username | `user@domain.com` |
| `SMTP_PASS` | *(Optional)* Generic SMTP password | `password` |

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **MySQL** (v8.0 or compatible instance running locally or hosted)
- **npm** or **pnpm** / **yarn**

### 2. Install Dependencies
```bash
npm install
```

### 3. Initialize Database Schema
```bash
# Push schema directly to the database configured in DATABASE_URL
npm run prisma:push

# Generate Prisma Client
npm run prisma:generate

# (Optional) Populate database with sample project hierarchy
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```
The server will be available at `http://localhost:3000`.

### 5. Run Test Suite
```bash
npm test
```

---

## 📡 API Reference & Endpoints

All responses are wrapped in a standard response envelope:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### 🔐 1. Authentication Endpoints

#### Register User
`POST /api/auth/register`
```json
// Request Body
{
  "email": "developer@uxcribe.com",
  "password": "SecurePassword123!",
  "role": "user"
}
```

#### Log In
`POST /api/auth/login`
```json
// Request Body
{
  "email": "developer@uxcribe.com",
  "password": "SecurePassword123!"
}
```
**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "c88f2441-2f3b-41ce-a517-8e7c376e1003",
      "email": "developer@uxcribe.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Forgot Password
`POST /api/auth/forgot-password`
```json
{
  "email": "developer@uxcribe.com"
}
```

#### Reset Password
`POST /api/auth/reset-password`
```json
{
  "token": "reset_token_from_email",
  "password": "NewSecurePassword123!"
}
```

---

### 👤 2. User Profile Endpoints (Requires Bearer Token)

- **Get Profile**: `GET /api/users/me`
- **Update Profile**: `PUT /api/users/me`
  ```json
  {
    "email": "new.email@uxcribe.com"
  }
  ```

---

### 📦 3. Polymorphic Block Endpoints (Requires Bearer Token)

#### 🌳 Fetch Hierarchical Tree (Optimized for Gantt Chart)
`GET /api/blocks/tree`

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Hierarchical block tree retrieved successfully",
  "data": [
    {
      "id": "e2a7b8e1-55bb-42c2-b52f-1014a5118742",
      "parent_id": null,
      "name": "Cloud Migration & Core Modernization",
      "type": "PROJECT",
      "status": "in_progress",
      "start_date": "2026-09-01T00:00:00.000Z",
      "end_date": "2026-11-30T00:00:00.000Z",
      "payload": {
        "budget": 200000,
        "client": "Acme Corp",
        "gantt": {
          "color": "#3b82f6",
          "criticalPath": true
        }
      },
      "children": [
        {
          "id": "a90b4d45-64d8-4f18-a681-35b91b8a9134",
          "parent_id": "e2a7b8e1-55bb-42c2-b52f-1014a5118742",
          "name": "Phase 1: Architecture & Prototyping",
          "type": "STAGE",
          "status": "completed",
          "start_date": "2026-09-01T00:00:00.000Z",
          "end_date": "2026-09-20T00:00:00.000Z",
          "payload": {
            "lead": "Tech Lead"
          },
          "children": [
            {
              "id": "f51c8901-1b2c-4d3e-9f0a-881122334455",
              "parent_id": "a90b4d45-64d8-4f18-a681-35b91b8a9134",
              "name": "Implement Database Migration Script",
              "type": "TASK",
              "status": "completed",
              "start_date": "2026-09-01T00:00:00.000Z",
              "end_date": "2026-09-10T00:00:00.000Z",
              "payload": {
                "assignee": "Database Engineer",
                "storyPoints": 5,
                "progress": 100
              },
              "children": []
            }
          ]
        }
      ]
    }
  ]
}
```

#### 📋 List Blocks (Flat & Filterable)
`GET /api/blocks?type=TASK&status=in_progress&schema_version=1&search=Migration`

**Query Parameters:**
- `type`: Filter by entity type (e.g. `PROJECT`, `STAGE`, `TASK`, `ASSET`)
- `parent_id`: Filter by parent ID or `null` for root blocks
- `status`: Filter by status (e.g. `pending`, `in_progress`, `completed`)
- `schema_version`: Filter by schema version number (e.g. `1`, `2`)
- `search`: Case-insensitive search on block `name`

#### 🔍 Get Single Block
`GET /api/blocks/:id`

#### ➕ Create Block
`POST /api/blocks`
```json
{
  "parent_id": "a90b4d45-64d8-4f18-a681-35b91b8a9134",
  "name": "Security Audit & Pen Testing",
  "type": "TASK",
  "status": "pending",
  "schema_version": 1,
  "start_date": "2026-10-01T00:00:00.000Z",
  "end_date": "2026-10-15T00:00:00.000Z",
  "payload": {
    "assignee": "SecOps Team",
    "priority": "HIGH",
    "tags": ["Security", "Compliance", "Audit"]
  }
}
```

#### ✏️ Update Block (with Automatic Payload Merge)
`PUT /api/blocks/:id`
```json
{
  "status": "in_progress",
  "schema_version": 1,
  "payload": {
    "progress": 50,
    "lastNote": "Initial scanning complete"
  }
}
```
*Note: Any existing keys in `payload` that are not supplied in the request are preserved.*

#### 🗑️ Delete Block (Cascade)
`DELETE /api/blocks/:id`
*Deletes the specified block and all descendant children recursively.*

---

## 📑 Documentación Interactiva & Esquema OpenAPI 3.0 (Swagger)

Este proyecto implementa el estándar global **OpenAPI 3.0.3**, ideal para que otros agentes de IA, clientes frontend, Postman o generadores de código consuman la API con total precisión:

- 🌐 **Swagger UI Interactivo**: [`http://localhost:3000/api/docs`](http://localhost:3000/api/docs) (para probar todos los endpoints y autenticación directamente en el navegador).
- 📄 **Esquema OpenAPI JSON**: [`openapi.json`](openapi.json) o vía endpoint en `/api/docs/openapi.json`.
- 📝 **Esquema OpenAPI YAML**: [`openapi.yaml`](openapi.yaml) o vía endpoint en `/openapi.yaml`.

### 💡 Consumo Automático desde Clientes Frontend / Agentes
Puedes generar automáticamente clientes tipados en TypeScript ejecutando en tu proyecto cliente:
```bash
# Con openapi-typescript
npx openapi-typescript http://localhost:3000/api/docs/openapi.json -o ./src/types/api.ts

# O importar openapi.json directamente en Postman, Insomnia o Bruno
```

---

Sigue estos pasos detallados para desplegar la API en **Render.com**:

### 1. Crear el Web Service
1. En el [Dashboard de Render](https://dashboard.render.com/), haz clic en **New +** y selecciona **Web Service**.
2. Conecta tu repositorio de GitHub: `vk7k/datablock-api`.
3. Configura los parámetros básicos del servicio:
   - **Name**: `datablock-api` (o el nombre de tu preferencia)
   - **Language**: `Node`
   - **Branch**: `main`
   - **Region**: `Oregon (US West)` (o la más cercana a tu base de datos)
   - **Instance Type**: `Free` ($0/mo) o `Starter`

### 2. Configurar Comandos de Build y Start
- **Build Command**:
  ```bash
  npm install && npx prisma generate && npx prisma db push
  ```
  *(Este comando instala dependencias, compila el cliente de Prisma y **crea automáticamente todas las tablas e índices** en tu base de datos remota sin necesidad de migraciones manuales).*

- **Start Command**:
  ```bash
  npm start
  ```

---

### 3. Configuración de Variables de Entorno (Environment Variables)

En la sección **Environment Variables** de Render, añade los siguientes valores:

| Variable | Valor / Ejemplo | Obligatorio | Notas |
| :--- | :--- | :---: | :--- |
| `NODE_ENV` | `production` | Sí | Activa optimizaciones de producción |
| `DATABASE_URL` | `mysql://USER:PASS@HOST:PORT/DB?sslaccept=strict` | **Sí** | **Requiere `?sslaccept=strict` al final** (ver detalle abajo) |
| `JWT_SECRET` | *(Cadena aleatoria y segura)* | Sí | Clave criptográfica para firmar JWTs |
| `JWT_EXPIRES_IN` | `7d` | No | Tiempo de expiración del token (por defecto: `7d`) |
| `RESEND_API_KEY` | `re_123456789abcdef...` | Opcional | API Key de [Resend.com](https://resend.com/api-keys) para emails |
| `MAIL_FROM` | `UXC Manager <onboarding@resend.dev>` | Opcional | Remitente de emails (ver detalle abajo) |
| `FRONTEND_URL` | `https://tu-app-frontend.com` | No | Origen permitido para CORS y enlaces de recuperación |

---

### ⚠️ Notas Críticas de Configuración para este Stack

#### 1. Formato de `DATABASE_URL` con SSL en la Nube
> [!IMPORTANT]
> Los proveedores de MySQL en la nube (como Aiven, PlanetScale, AWS RDS, TiDB, Render MySQL) exigen conexiones cifradas mediante SSL/TLS.
> 
> Si tu cadena de conexión no incluye el parámetro SSL al final, Prisma arrojará el error `P1001: Can't reach database server` o fallará el handshake SSL.
> 
> **Formato correcto:**
> ```env
> DATABASE_URL="mysql://usuario:contraseña@servidor.com:3306/nombre_db?sslaccept=strict"
> ```

#### 2. Configuración del Servicio de Correo con Resend (`RESEND_API_KEY`)
> [!TIP]
> - **Para pruebas y desarrollo rápido:** Si aún no has verificado un dominio propio en Resend, utiliza el remitente de pruebas de Resend:
>   ```env
>   MAIL_FROM="UXC Manager <onboarding@resend.dev>"
>   ```
>   *(Ten en cuenta que en modo `onboarding@resend.dev`, Resend solo permite enviar emails a la dirección de correo con la que creaste tu cuenta en Resend).*
> - **Para producción:** Una vez verificado tu dominio en [resend.com/domains](https://resend.com/domains), cambia el `MAIL_FROM` a tu dominio propio (ej. `UXC Manager <soporte@tudominio.com>`).
> - **Modo Resiliente (Sin API Key):** Si no configuras `RESEND_API_KEY`, el servidor continuará funcionando con normalidad; en lugar de fallar, registrará el contenido del email formateado directamente en la consola/logs de Render.

---

## 📜 Licencia

Este proyecto está bajo la Licencia [ISC](LICENSE).
