# 📘 DataBlock API - Especificación Técnica y Guía de Integración para Desarrolladores

**Versión de Especificación:** 1.0.0  
**Arquitectura:** Universal Polymorphic Node (Single Table Inheritance con Documentos JSON)  
**Stack Base:** Node.js 18+ • Express 4 • MySQL 8+ • Prisma ORM • JWT  
**Contrato OpenAPI:** OpenAPI 3.0.3 ([`openapi.yaml`](openapi.yaml) / [`openapi.json`](openapi.json))  

---

## 📑 Tabla de Contenidos

1. [Filosofía Arquitectónica](#1-filosofía-arquitectónica)
2. [Modelo de Datos Físico (MySQL & Prisma)](#2-modelo-de-datos-físico-mysql--prisma)
3. [Protocolo de Comunicación y Envelopes Estándar](#3-protocolo-de-comunicación-y-envelopes-estándar)
4. [Autenticación y Seguridad](#4-autenticación-y-seguridad)
5. [Referencia Completa de Endpoints](#5-referencia-completa-de-endpoints)
   - [🔐 Autenticación](#51-autenticación-apiauth)
   - [👤 Usuarios](#52-usuarios-apiusers)
   - [📦 Motor de Bloques (CRUD y Árbol)](#53-motor-de-bloques-apiblocks)
   - [📐 Catálogo de Esquemas de Documentos](#54-catálogo-de-esquemas-de-documentos-apischemas)
   - [🗄️ Diagnóstico y Explorador MySQL](#55-diagnóstico-y-explorador-mysql-apidatabase)
6. [Estándar de Esquemas de Payload en Código (`schemas/`)](#6-estándar-de-esquemas-de-payload-en-código-schemas)
7. [Ejemplos de Integración para Desarrolladores](#7-ejemplos-de-integración-para-desarrolladores)
   - [TypeScript / JavaScript](#71-typescript--javascript-fetch)
   - [Python](#72-python-requests)
   - [cURL](#73-curl-para-terminal)
8. [Despliegue y Configuración en Producción (Render.com)](#8-despliegue-y-configuración-en-producción-rendercom)

---

## 1. Filosofía Arquitectónica

DataBlock API implementa el patrón **Nodo Polimórfico Universal**. En lugar de crear tablas relacionales rígidas para cada entidad (`projects`, `tasks`, `characters`, `products`, `invoices`), la base de datos se basa en una única estructura fija y eficiente:

```text
┌───────────────────────────────────────────────────────────────────┐
│                           BLOQUE BASE                             │
│  - id (UUID)                                                      │
│  - parent_id (UUID -> blocks.id, Auto-referencia / Cascada)       │
│  - payload_type (VARCHAR: "PROJECT", "TASK", "STORE", etc.)       │
│  - payload_type_version (INT: 1, 2, 3...)                         │
│  - created_at / updated_at (DATETIME)                             │
├───────────────────────────────────────────────────────────────────┤
│                   DOCUMENTO DE DOMINIO (JSON)                     │
│  payload: {                                                       │
│    "name": "...",                                                 │
│    "status": "in_progress",                                       │
│    "fechas", "presupuestos", "estadísticas", etc.                 │
│  }                                                                │
└───────────────────────────────────────────────────────────────────┘
```

### Ventajas Clave
1. **Jerarquía Infinita:** Cualquier bloque puede ser padre de cualquier otro bloque (`parent_id`), permitiendo representar diagramas de Gantt, WBS, mapas de videojuegos o esquemas de base de datos con profundidad arbitraria.
2. **Construcción de Árbol en Tiempo Lineal $O(N)$:** El endpoint `GET /api/blocks/tree` transforma todos los registros relacionales en un árbol anidado en un solo pase de memoria sin consultas recursivas a la base de datos.
3. **Inmutabilidad y Compatibilidad de Esquemas:** Los esquemas base residen en el código (`schemas/<dominio>/<tipo>.<version>.json`). La base de datos nunca necesita migraciones DDL cuando se añade un nuevo tipo o versión de bloque.
4. **Fusión Inteligente (Shallow Merge):** Al hacer `PUT /api/blocks/:id`, los atributos enviados dentro de `payload` se fusionan de forma segura con los existentes sin borrar campos no especificados.

---

## 2. Modelo de Datos Físico (MySQL & Prisma)

El esquema se encuentra definido en [`prisma/schema.prisma`](prisma/schema.prisma):

```prisma
model Block {
  id                   String    @id @default(uuid()) @db.VarChar(36)
  parent_id            String?   @map("parent_id") @db.VarChar(36)
  payload_type         String    @default("GENERIC") @map("payload_type") @db.VarChar(50)
  payload_type_version Int       @default(1) @map("payload_type_version")
  payload              Json?     @db.Json
  created_at           DateTime  @default(now()) @map("created_at")
  updated_at           DateTime  @updatedAt @map("updated_at")

  // Relación auto-referencial con eliminación en cascada
  parent   Block?  @relation("BlockHierarchy", fields: [parent_id], references: [id], onDelete: Cascade)
  children Block[] @relation("BlockHierarchy")

  @@index([parent_id])
  @@index([payload_type])
  @@index([payload_type_version])
  @@map("blocks")
}

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
```

---

## 3. Protocolo de Comunicación y Envelopes Estándar

Todas las respuestas del API utilizan una envoltura (envelope) JSON homogénea:

### Respuesta Exitosa (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "message": "Operación completada exitosamente",
  "data": { ... }
}
```

### Respuesta de Error (`400`, `401`, `403`, `404`, `500`)
```json
{
  "success": false,
  "message": "Mensaje descriptivo del error",
  "errors": {
    "campo": "Descripción de la regla de validación fallida"
  }
}
```

---

## 4. Autenticación y Seguridad

DataBlock API utiliza autenticación **JWT Bearer**. 

1. Envía tus credenciales a `POST /api/auth/login`.
2. Extrae el `token` retornado.
3. Incluye el token en el encabezado HTTP de todas las solicitudes privadas:
   ```http
   Authorization: Bearer <TU_JWT_TOKEN>
   ```
4. El token tiene una validez por defecto de **7 días** (`JWT_EXPIRES_IN=7d`).

---

## 5. Referencia Completa de Endpoints

### 5.1. Autenticación (`/api/auth`)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | Público | Registra un nuevo usuario (`email`, `password`, `role`). |
| `POST` | `/api/auth/login` | Público | Autentica y retorna el token JWT Bearer. |
| `POST` | `/api/auth/forgot-password` | Público | Solicita token de recuperación de contraseña por email. |
| `POST` | `/api/auth/reset-password` | Público | Establece nueva contraseña usando token de recuperación. |

#### Ejemplo de Login:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@uxcribe.com",
  "password": "AdminPass123!"
}
```
**Respuesta:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "7bf3b3c4-406a-4d29-b68a-6695328905fe",
      "email": "admin@uxcribe.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 5.2. Usuarios (`/api/users`)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/users/me` | Bearer | Retorna los datos del usuario autenticado. |
| `PUT` | `/api/users/profile` | Bearer | Actualiza el perfil del usuario (ej. cambiar email). |

---

### 5.3. Motor de Bloques (`/api/blocks`)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/blocks/tree` | Bearer | **Árbol Jerárquico $O(N)$**: Nodos raíces con hijos anidados recursivamente en `children: []`. Ideal para Gantt y WBS. |
| `GET` | `/api/blocks` | Bearer | Lista plana con filtros opcionales (`payload_type`, `parent_id`, `payload_type_version`, `search`). |
| `GET` | `/api/blocks/:id` | Bearer | Obtiene el detalle completo de un bloque por su UUID. |
| `POST` | `/api/blocks` | Bearer | Crea un nuevo bloque raíz (`parent_id: null`) o hijo (`parent_id: "UUID"`). |
| `PUT` | `/api/blocks/:id` | Bearer | Actualiza campos del bloque con fusión automática (shallow merge) de `payload`. |
| `DELETE` | `/api/blocks/:id` | Bearer | Elimina el bloque y **todos sus descendientes en cascada**. |

#### Parámetros de Filtro en `GET /api/blocks`:
* `payload_type`: Filtra por tipo (ej. `TASK`, `PROJECT`, `STORE`, `GAME`, `TABLE`).
* `payload_type_version`: Filtra por versión del esquema (ej. `1`, `2`).
* `parent_id`: Filtra por UUID del bloque padre, o `null` / `root` para obtener solo nodos raíz.
* `search`: Búsqueda de texto insensible a mayúsculas dentro de todo el contenido del JSON `payload`.

#### Ejemplo de Creación de Bloque (`POST /api/blocks`):
```http
POST /api/blocks
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "parent_id": "e2a7b8e1-55bb-42c2-b52f-1014a5118742",
  "payload_type": "TASK",
  "payload_type_version": 1,
  "payload": {
    "name": "Implementar índices compuestos en MySQL",
    "status": "in_progress",
    "assignee": "Equipo Backend",
    "start_date": "2026-09-01T00:00:00.000Z",
    "due_date": "2026-09-10T00:00:00.000Z",
    "progress": 65,
    "priority": "HIGH",
    "tags": ["MySQL", "Prisma", "Performance"]
  }
}
```

#### Ejemplo de Actualización con Fusión (`PUT /api/blocks/:id`):
```http
PUT /api/blocks/f51c8901-1b2c-4d3e-9f0a-881122334455
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "payload": {
    "status": "completed",
    "progress": 100
  }
}
```
*(Los campos anteriores como `name`, `assignee`, `tags`, etc., se conservan intactos).*

---

### 5.4. Catálogo de Esquemas de Documentos (`/api/schemas`)

Permite a clientes frontend, agentes y desarrolladores descubrir en tiempo real las plantillas y formatos estándar oficiales disponibles en el proyecto:

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/schemas` | Bearer | Retorna todos los esquemas oficiales agrupados por dominio temático (`project`, `gamedev`, `database`, `film`, `edtech`, `ecommerce`, `generic`). |
| `GET` | `/api/schemas/:type/:version?` | Bearer | Retorna la plantilla estándar de un tipo específico (ej. `/api/schemas/TASK/1`). |

---

### 5.5. Diagnóstico y Explorador MySQL (`/api/database`)

Endpoints administrativos para monitoreo y verificación de la infraestructura de datos:

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/database/status` | Bearer | Estado del servidor MySQL (versión, tablas, filas, tamaño, SSL activo, uptime). |
| `GET` | `/api/database/tables` | Bearer | Lista de tablas, motor de almacenamiento, tamaño e índice de filas. |
| `GET` | `/api/database/tables/:tableName/schema` | Bearer | Columnas, tipos de datos, nulabilidad, claves foráneas e índices de la tabla. |
| `GET` | `/api/database/tables/:tableName/data` | Bearer | Explorador de registros paginado con tiempo de ejecución en milisegundos. |
| `POST` | `/api/database/query` | Bearer | Ejecuta una consulta SQL en tiempo real (modo consola interactiva). |
| `POST` | `/api/database/test-connection` | Bearer | Prueba una cadena de conexión remota midiendo ping y verificando SSL. |

---

## 6. Estándar de Esquemas de Payload en Código (`schemas/`)

Todos los formatos oficiales residen en archivos JSON organizados por carpetas de dominio dentro del directorio `schemas/`:

```text
datablock-api/
└── schemas/
    ├── project/           # 📁 Gestión Integral de Proyectos
    │   ├── project.v1.json
    │   ├── phase.v1.json
    │   ├── milestone.v1.json
    │   ├── task.v1.json
    │   ├── deliverable.v1.json
    │   ├── risk.v1.json
    │   └── budget_item.v1.json
    ├── gamedev/           # 🎮 Desarrollo de Videojuegos
    │   ├── game.v1.json
    │   ├── level.v1.json
    │   ├── character.v1.json
    │   ├── quest.v1.json
    │   ├── asset_3d.v1.json
    │   ├── audio_vfx.v1.json
    │   └── item_equipment.v1.json
    ├── database/          # 🗄️ Arquitectura Cloud & Bases de Datos
    │   ├── database_cluster.v1.json
    │   ├── schema.v1.json
    │   ├── table.v1.json
    │   ├── column.v1.json
    │   ├── index.v1.json
    │   └── migration.v1.json
    ├── film/              # 🎬 Producción de Cine & VFX
    │   ├── film_project.v1.json
    │   ├── scene.v1.json
    │   ├── shot.v1.json
    │   └── render_pass.v1.json
    ├── edtech/            # 📚 Educación & E-Learning
    │   ├── course.v1.json
    │   ├── module.v1.json
    │   ├── lesson.v1.json
    │   └── quiz.v1.json
    ├── ecommerce/         # 🛒 Comercio Electrónico & Facturación
    │   ├── store.v1.json
    │   ├── category.v1.json
    │   ├── product.v1.json
    │   └── invoice.v1.json
    └── generic/           # ✨ Documentos y Notas Genéricas
        ├── generic.v1.json
        ├── document.v1.json
        └── note.v1.json
```

### ¿Cómo agregar un nuevo tipo o versión?
1. Crea el archivo en la subcarpeta correspondiente, por ejemplo:  
   `schemas/ecommerce/store.v2.json`.
2. Define la estructura JSON estándar que tendrá el documento.
3. **¡Listo!** El backend detectará automáticamente el esquema en `GET /api/schemas` y estará disponible en el frontend como `STORE (v2)` sin necesidad de alterar la base de datos MySQL.

---

## 7. Ejemplos de Integración para Desarrolladores

### 7.1. TypeScript / JavaScript (Fetch)

```typescript
const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// 1. Autenticación
async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  authToken = json.data.token;
  return authToken;
}

// 2. Obtener Árbol Jerárquico para Gantt
interface BlockNode {
  id: string;
  parent_id: string | null;
  payload_type: string;
  payload_type_version: number;
  payload: Record<string, any>;
  children: BlockNode[];
}

async function getBlockTree(): Promise<BlockNode[]> {
  const res = await fetch(`${BASE_URL}/blocks/tree`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
  const json = await res.json();
  return json.data;
}

// 3. Crear un Bloque Hijo
async function createChildBlock(parentId: string, type: string, payload: any) {
  const res = await fetch(`${BASE_URL}/blocks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent_id: parentId,
      payload_type: type,
      payload_type_version: 1,
      payload,
    }),
  });
  return res.json();
}
```

---

### 7.2. Python (Requests)

```python
import requests

BASE_URL = "http://localhost:3000/api"

# 1. Login
session = requests.Session()
login_res = session.post(f"{BASE_URL}/auth/login", json={
    "email": "admin@uxcribe.com",
    "password": "AdminPass123!"
}).json()

token = login_res["data"]["token"]
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# 2. Obtener Árbol
tree_res = requests.get(f"{BASE_URL}/blocks/tree", headers=headers).json()
print(f"Total nodos raíz: {len(tree_res['data'])}")

# 3. Filtrar Bloques
filtered_res = requests.get(f"{BASE_URL}/blocks", headers=headers, params={
    "payload_type": "TASK",
    "search": "MySQL"
}).json()
print(f"Tareas encontradas: {len(filtered_res['data'])}")
```

---

### 7.3. cURL para Terminal

```bash
# 1. Obtener Token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@uxcribe.com","password":"AdminPass123!"}' | jq -r .data.token)

# 2. Consultar Árbol Completo
curl -s -X GET http://localhost:3000/api/blocks/tree \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Crear Bloque Raíz
curl -s -X POST http://localhost:3000/api/blocks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payload_type": "PROJECT",
    "payload_type_version": 1,
    "payload": {
      "name": "Lanzamiento App Móvil v2.0",
      "status": "in_progress",
      "budget": 50000,
      "currency": "USD"
    }
  }' | jq
```

---

## 8. Despliegue y Configuración en Producción (Render.com)

DataBlock API está lista para despliegue continuo en **Render.com**.

### Comandos de Construcción y Ejecución
* **Build Command:**
  ```bash
  npm install && npx prisma generate && npx prisma db push
  ```
  *(Instala dependencias, genera el cliente tipado y sincroniza automáticamente las tablas en MySQL).*
* **Start Command:**
  ```bash
  npm start
  ```

### Variables de Entorno Requeridas

| Variable | Valor de Ejemplo | Requerido | Descripción |
| :--- | :--- | :---: | :--- |
| `NODE_ENV` | `production` | Sí | Activa optimizaciones de producción |
| `DATABASE_URL` | `mysql://user:pass@host:3306/db?sslaccept=strict` | **Sí** | Conexión MySQL (**requiere `?sslaccept=strict` en la nube**) |
| `JWT_SECRET` | `clave_criptografica_super_secreta_aqui` | Sí | Firma de tokens JWT |
| `PORT` | `3000` | No | Puerto HTTP de escucha |
| `RESEND_API_KEY` | `re_123456789...` | Opcional | API Key de correos transaccionales |
| `MAIL_FROM` | `UXC Studio <onboarding@resend.dev>` | Opcional | Remitente de emails |
| `FRONTEND_URL` | `https://tu-frontend.com` | Opcional | Origen habilitado para CORS |

> [!IMPORTANT]
> **Parámetro SSL en Bases de Datos Remotas:**
> En proveedores de MySQL gestionado (Render, TiDB Cloud, PlanetScale, AWS RDS, Aiven), es mandatorio incluir `?sslaccept=strict` al final del `DATABASE_URL`. De lo contrario, Prisma no podrá establecer la conexión segura TLS.
