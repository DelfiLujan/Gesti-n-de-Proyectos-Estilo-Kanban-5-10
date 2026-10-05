# API REST Kanban (Tableros → Columnas → Tickets)

Backend robusto para una aplicación estilo Kanban estructurado bajo una jerarquía Padre-Hijo-Nieto (`Board` → `Column` → `Ticket`), con rutas estrictamente anidadas, validaciones semánticas, aislamiento de recursos, control de concurrencia optimista y borrado en cascada.

---

## 🛠 Stack Tecnológico

| Componente | Tecnología | Versión / Detalle |
|---|---|---|
| **Runtime** | Node.js | >= 20.x LTS |
| **Framework** | Express | 4.19.x |
| **Base de Datos** | MongoDB + Mongoose | 8.x |
| **Configuración** | dotenv | Variables de entorno |
| **Seguridad & Utilidades** | helmet, cors, morgan | Headers de seguridad, CORS y logger HTTP |
| **Desarrollo** | nodemon | Recarga en caliente |

---

## 📁 Arquitectura y Estructura del Proyecto

El proyecto sigue el principio de **Responsabilidad Única (SRP)**:
- **Modelos (`src/models/`)**: Esquemas de Mongoose, índices, referencias y hooks de documento para borrado en cascada.
- **Controladores (`src/controllers/`)**: Lógica pura de petición/respuesta envuelta en `asyncHandler`.
- **Rutas (`src/routes/`)**: Mapeo modular con `express.Router({ mergeParams: true })` para transmitir identificadores padre a hijos.
- **Middlewares (`src/middlewares/`)**: Validaciones transversales (formato 24-hex de IDs, Parent Check, aislamiento de tablero y payloads).
- **Manejo de Errores (`src/middlewares/errorHandler.js`, `src/utils/AppError.js`)**: Respuestas de error centralizadas y consistentes bajo el formato `{ "error": "mensaje" }`.

```text
.
├── AGENTS.md                   # Fuente de la verdad y reglas de negocio
├── README.md                   # Documentación del proyecto
├── .env.example                # Plantilla de variables de entorno
├── .gitignore                  # Exclusiones de Git (node_modules, .env, etc.)
├── package.json
├── thunder-collection.json     # Suite de pruebas para Thunder Client
├── postman_collection.json     # Suite de pruebas para Postman
└── src/
    ├── server.js               # Conexión a DB y levantamiento del servidor
    ├── app.js                  # Configuración de Express y middlewares globales
    ├── config/
    │   └── db.js               # Conexión a MongoDB con Mongoose
    ├── models/
    │   ├── Board.js            # Modelo Tablero con virtuals y cascada
    │   ├── Column.js           # Modelo Columna con cascada
    │   └── Ticket.js           # Modelo Ticket con optimisticConcurrency
    ├── controllers/
    │   ├── board.controller.js
    │   ├── column.controller.js
    │   └── ticket.controller.js
    ├── routes/
    │   ├── board.routes.js     # /api/boards
    │   ├── column.routes.js    # /api/boards/:boardId/columns
    │   └── ticket.routes.js    # /api/boards/:boardId/columns/:columnId/tickets
    ├── middlewares/
    │   ├── validateObjectId.js # Validación estricta con regex (/^[0-9a-fA-F]{24}$/)
    │   ├── loadBoard.js        # Parent Check de existencia de tablero
    │   ├── loadColumn.js       # Parent Check + Aislamiento entre tableros
    │   ├── validateBody.js     # Validación de cuerpos JSON sin librerías externas
    │   ├── notFound.js         # Manejador 404 para rutas inexistentes
    │   └── errorHandler.js     # Manejador global estructurado de errores
    └── utils/
        ├── AppError.js         # Clase de error operacional con statusCode
        └── asyncHandler.js     # Captura de errores asíncronos para Express
```

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- **Node.js** 20 LTS o superior instalado.
- **MongoDB** en ejecución localmente (`mongodb://127.0.0.1:27017`) o un clúster en **MongoDB Atlas**.

### 1. Clonar el repositorio
```bash
git clone https://github.com/DelfiLujan/Gesti-n-de-Proyectos-Estilo-Kanban-5-10.git
cd Gesti-n-de-Proyectos-Estilo-Kanban-5-10
```

### 2. Configurar variables de entorno
Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```
Edita `.env` con tus configuraciones:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/kanban_db
NODE_ENV=development
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Ejecutar el servidor
- **Modo desarrollo (con recarga automática):**
  ```bash
  npm run dev
  ```
- **Modo producción:**
  ```bash
  npm start
  ```

---

## 📌 Contrato de la API y Endpoints

Todas las rutas base inician con `/api/boards`.

| Método | Endpoint | Descripción | Éxito |
|---|---|---|---|
| `POST` | `/api/boards` | Crea un nuevo tablero | `201 Created` |
| `GET` | `/api/boards/:boardId` | Obtiene un tablero con columnas y tickets poblados | `200 OK` |
| `POST` | `/api/boards/:boardId/columns` | Agrega una columna a un tablero | `201 Created` |
| `DELETE` | `/api/boards/:boardId/columns/:columnId` | Elimina una columna y sus tickets en cascada | `204 No Content` |
| `POST` | `/api/boards/:boardId/columns/:columnId/tickets` | Crea un ticket dentro de una columna | `201 Created` |
| `PATCH` | `/api/boards/:boardId/columns/:columnId/tickets/:ticketId` | Actualiza un ticket o lo mueve de columna | `200 OK` |

---

### Ejemplos de Peticiones y Respuestas

#### 1. Crear Tablero
- **`POST /api/boards`**
- **Body:**
  ```json
  {
    "name": "Proyecto Sprint 1"
  }
  ```
- **Respuesta (`201 Created`):**
  ```json
  {
    "_id": "6701a2b3c4d5e6f7a8b9c0d1",
    "name": "Proyecto Sprint 1",
    "createdAt": "2026-10-05T17:00:00.000Z",
    "updatedAt": "2026-10-05T17:00:00.000Z"
  }
  ```

#### 2. Obtener Tablero con Columnas y Tickets
- **`GET /api/boards/:boardId`**
- **Respuesta (`200 OK`):**
  ```json
  {
    "_id": "6701a2b3c4d5e6f7a8b9c0d1",
    "name": "Proyecto Sprint 1",
    "columns": [
      {
        "_id": "6701a2b3c4d5e6f7a8b9c0d2",
        "name": "Por Hacer",
        "order": 1,
        "board": "6701a2b3c4d5e6f7a8b9c0d1",
        "tickets": [
          {
            "_id": "6701a2b3c4d5e6f7a8b9c0d3",
            "title": "Configurar MongoDB",
            "description": "Conectar Mongoose 8",
            "position": 0,
            "column": "6701a2b3c4d5e6f7a8b9c0d2",
            "board": "6701a2b3c4d5e6f7a8b9c0d1"
          }
        ]
      }
    ]
  }
  ```

#### 3. Crear Columna
- **`POST /api/boards/:boardId/columns`**
- **Body:**
  ```json
  {
    "name": "En Progreso",
    "order": 2
  }
  ```
- **Respuesta (`201 Created`):**
  ```json
  {
    "_id": "6701a2b3c4d5e6f7a8b9c0d4",
    "name": "En Progreso",
    "order": 2,
    "board": "6701a2b3c4d5e6f7a8b9c0d1",
    "createdAt": "2026-10-05T17:01:00.000Z"
  }
  ```

#### 4. Crear Ticket
- **`POST /api/boards/:boardId/columns/:columnId/tickets`**
- **Body:**
  ```json
  {
    "title": "Diseñar esquema de base de datos",
    "description": "Board, Column y Ticket con cascade hooks",
    "position": 0
  }
  ```
- **Respuesta (`201 Created`):**
  ```json
  {
    "_id": "6701a2b3c4d5e6f7a8b9c0d5",
    "title": "Diseñar esquema de base de datos",
    "description": "Board, Column y Ticket con cascade hooks",
    "position": 0,
    "column": "6701a2b3c4d5e6f7a8b9c0d4",
    "board": "6701a2b3c4d5e6f7a8b9c0d1",
    "createdAt": "2026-10-05T17:02:00.000Z"
  }
  ```

#### 5. Mover o Actualizar Ticket (Idempotente)
- **`PATCH /api/boards/:boardId/columns/:columnId/tickets/:ticketId`**
- **Body:**
  ```json
  {
    "title": "Diseño de esquemas finalizado",
    "position": 1,
    "columnId": "6701a2b3c4d5e6f7a8b9c0d2"
  }
  ```
- **Respuesta (`200 OK`):**
  ```json
  {
    "_id": "6701a2b3c4d5e6f7a8b9c0d5",
    "title": "Diseño de esquemas finalizado",
    "description": "Board, Column y Ticket con cascade hooks",
    "position": 1,
    "column": "6701a2b3c4d5e6f7a8b9c0d2",
    "board": "6701a2b3c4d5e6f7a8b9c0d1",
    "updatedAt": "2026-10-05T17:03:00.000Z"
  }
  ```

#### 6. Eliminar Columna (Cascada)
- **`DELETE /api/boards/:boardId/columns/:columnId`**
- **Respuesta (`204 No Content`)**: Sin cuerpo. Elimina automáticamente todos los tickets pertenecientes a la columna.

---

## 🔒 Reglas de Negocio Implementadas

1. **Parent Check Estricto:**
   - Antes de crear una columna, se verifica la existencia real del tablero (`404` si no existe).
   - Antes de crear o actualizar tickets, se verifica la existencia de la columna y el tablero (`404` si no existen).
2. **Aislamiento de Rutas:**
   - Si una columna existe pero pertenece a un tablero diferente al `:boardId` indicado en la URL, el sistema responde **`404 Not Found`** para evitar fugas de información inter-tableros.
   - Si se intenta mover un ticket (`PATCH`) hacia una columna de otro tablero, la petición se rechaza con **`404 Not Found`**.
3. **Idempotencia y Concurrencia:**
   - Los updates usan operaciones atómicas `$set` en `findOneAndUpdate`.
   - Reintentar una petición `PATCH` idéntica no produce duplicados ni errores, devolviendo el estado actual con `200 OK`.
   - Esquema de `Ticket` con `optimisticConcurrency: true`: ante colisiones de versión responde `409 Conflict`.
4. **Respuestas de Error Homogéneas:**
   - Todos los errores devuelven un JSON consistente: `{ "error": "mensaje descriptivo" }`.
   - Errores de cliente por formato de ID o payload incompleto responden `400 Bad Request`.
   - Errores inesperados responden `500 Internal Server Error` sin exponer stack traces ni internals de Mongoose al cliente.

---

## 🧪 Pruebas Automatizadas con Thunder Client / Postman

El repositorio incluye dos suites completas de pruebas:
- [`thunder-collection.json`](./thunder-collection.json) (formato nativo Thunder Client para VS Code).
- [`postman_collection.json`](./postman_collection.json) (formato nativo Postman).

### Cómo ejecutar las pruebas en Thunder Client (VS Code)
1. Instala la extensión **Thunder Client** en VS Code.
2. Abre la pestaña de Thunder Client en la barra lateral.
3. Ve a **Collections** → clic en el menú `...` → **Import** → selecciona `thunder-collection.json`.
4. Asegúrate de tener el servidor levantado (`npm run dev`).
5. Abre la colección importada **API Kanban** y haz clic en **Run All**.
6. Todas las 17 peticiones pasarán en verde:
   - ✅ Casos exitosos (200, 201, 204).
   - ✅ Validaciones de IDs mal formados (400).
   - ✅ Validaciones de payloads incompletos (400).
   - ✅ Parent check y recursos inexistentes (404).
   - ✅ Aislamiento entre tableros distintos (404).
   - ✅ Pruebas de idempotencia en PATCH (200).
   - ✅ Borrado en cascada (204).

---

## ☁️ Guía de Despliegue en la Nube (Render / Railway)

### Despliegue en Render
1. Sube tu código a un repositorio de GitHub público o privado.
2. Crea una base de datos gratuita en [MongoDB Atlas](https://www.mongodb.com/atlas) y obtén tu Connection String (`mongodb+srv://...`).
3. En [Render.com](https://render.com), crea un nuevo **Web Service** conectado a tu repositorio.
4. Configura los parámetros:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. En la sección **Environment Variables**, añade:
   - `PORT`: `3000` (o el asignado por Render)
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Tu cadena de conexión completa de MongoDB Atlas.
6. Haz clic en **Deploy Web Service**. Una vez terminado, tu API estará disponible públicamente bajo la URL generada por Render.
