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
- **Input Validation & Error Handling**:
  - Strict schema validations via **Zod** middleware.
  - Centralized error handler with standardized JSON response envelopes.
- **Cloud-Ready for Render.com**:
  - Pre-configured `render.yaml` blueprint with build hooks and automated Prisma schema generation.

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
  id         String    @id @default(uuid()) @db.VarChar(36)
  parent_id  String?   @map("parent_id") @db.VarChar(36)
  name       String    @db.VarChar(255)
  start_date DateTime  @map("start_date")
  end_date   DateTime  @map("end_date")
  status     String    @default("pending") @db.VarChar(50)
  type       String    @db.VarChar(50)
  payload    Json?     @db.Json
  created_at DateTime  @default(now()) @map("created_at")
  updated_at DateTime  @updatedAt @map("updated_at")

  parent   Block?  @relation("BlockHierarchy", fields: [parent_id], references: [id], onDelete: Cascade)
  children Block[] @relation("BlockHierarchy")

  @@index([parent_id])
  @@index([type])
  @@index([status])
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
| `DATABASE_URL` | MySQL Connection URI | `mysql://root:@localhost:3306/block_system` |
| `JWT_SECRET` | Secret key for JWT signing | `super_secret_jwt_key_here` |
| `JWT_EXPIRES_IN` | JWT token validity window | `7d` |
| `RESEND_API_KEY` | *(Optional)* Resend API Key for transactional emails | `re_123456789...` |
| `MAIL_FROM` | Default sender email address | `UXC Manager <noreply@yourdomain.com>` |
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
`GET /api/blocks?type=TASK&status=in_progress&search=Migration`

**Query Parameters:**
- `type`: Filter by entity type (e.g. `PROJECT`, `STAGE`, `TASK`, `ASSET`)
- `parent_id`: Filter by parent ID or `null` for root blocks
- `status`: Filter by status (e.g. `pending`, `in_progress`, `completed`)
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

## ☁️ Deployment on Render.com

This repository includes a [`render.yaml`](render.yaml) specification:

1. Push your code to GitHub / GitLab.
2. Navigate to [Render Dashboard](https://dashboard.render.com/) -> **New** -> **Blueprint**.
3. Select this repository.
4. Provide the required production environment variables:
   - `DATABASE_URL`: Hosted MySQL connection string (e.g. Aiven, PlanetScale, AWS RDS, Render MySQL).
   - `JWT_SECRET`: Secure cryptographic string.
   - `RESEND_API_KEY`: API Key from [Resend](https://resend.com/).
   - `FRONTEND_URL`: Client frontend URL.

---

## 📜 License

This project is licensed under the [ISC License](LICENSE).
