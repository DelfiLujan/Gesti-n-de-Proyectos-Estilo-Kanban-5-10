# Contrato Oficial del Backend (DevBoard API)

> **Documento generado en el PASO 0 de `docs/PLAN_FRONTEND.md`**  
> Este documento representa la **única fuente de verdad** del estado real del backend en este repositorio. Cualquier desarrollo frontend debe apegarse estrictamente a lo aquí documentado.

---

## 1. Stack Tecnológico del Backend

| Componente | Tecnología | Versión / Detalle |
|---|---|---|
| **Runtime** | Node.js | `>= 20.x LTS` (CommonJS `require`) |
| **Framework Web** | Express | `4.19.2` |
| **Base de Datos & ODM** | MongoDB + Mongoose | `8.3.0` |
| **Variables de Entorno** | dotenv | `16.4.5` |
| **Seguridad & Middlewares** | helmet (`7.1.0`), cors (`2.8.5`), morgan (`1.10.0`) | Headers HTTP seguros, CORS permisivo por defecto, logger en desarrollo |
| **Servidor de Desarrollo** | nodemon | `3.1.0` |

---

## 2. Puerto Local y Configuración de CORS

- **Puerto local por defecto:** `3000` (definido en `.env.example` y fallback en `src/server.js`: `process.env.PORT || 3000`).
- **Base URL local:** `http://localhost:3000`
- **Configuración CORS:** Implementada en `src/app.js` mediante:
  ```javascript
  app.use(cors());
  ```
  Actualmente permite cualquier origen (`*`) con métodos HTTP estándar (`GET`, `POST`, `PATCH`, `DELETE`, etc.). No requiere credenciales ni headers especiales.

---

## 3. Mecanismo de Autenticación

> ⚠️ **IMPORTANTE (Divergencia con consigna general):**  
> **El backend NO implementa ningún mecanismo de autenticación.**

- **Tipo de token:** No existe (no hay JWT, cookies ni sesiones).
- **Header requerido:** Ninguno (no se requiere `Authorization: Bearer <token>`).
- **Expiración de sesión:** Inexistente.
- **Respuesta 401 Unauthorized:** El backend **nunca responde 401**. Todas las rutas son públicas.
- **Rutas de Login / Registro:** **No existen** en el backend.

---

## 4. Modelos de Datos

### 4.1. Board (Tablero) — `src/models/Board.js`
- `_id`: `ObjectId` (24 hex, generado por MongoDB).
- `name`: `String` (Requerido, trim, máximo 100 caracteres).
- `createdAt`: `Date` (timestamp ISO).
- `updatedAt`: `Date` (timestamp ISO).
- `columns`: Virtual poblado referenciando a `Column` (`localField: '_id'`, `foreignField: 'board'`).

### 4.2. Column (Columna) — `src/models/Column.js`
- `_id`: `ObjectId` (24 hex).
- `name`: `String` (Requerido, trim).
- `board`: `ObjectId` (`ref: 'Board'`, requerido, indexado).
- `order`: `Number` (Opcional, default: `0`).
- `createdAt`: `Date` (timestamp ISO).
- `updatedAt`: `Date` (timestamp ISO).
- `tickets`: Virtual poblado referenciando a `Ticket` (`localField: '_id'`, `foreignField: 'column'`).

### 4.3. Ticket (Tarjeta) — `src/models/Ticket.js`
- `_id`: `ObjectId` (24 hex).
- `title`: `String` (Requerido, trim, no puede ser vacío).
- `description`: `String` (Opcional, trim).
- `position`: `Number` (Opcional, default: `0`).
- `column`: `ObjectId` (`ref: 'Column'`, requerido, indexado).
- `board`: `ObjectId` (`ref: 'Board'`, requerido, indexado).
- `createdAt`: `Date` (timestamp ISO).
- `updatedAt`: `Date` (timestamp ISO).
- `__v`: `Number` (Control de concurrencia optimista `optimisticConcurrency: true`).

> ⚠️ **Valores válidos de `priority`:**  
> **NO EXISTE el campo `priority` en el modelo `Ticket` del backend.** Los únicos campos soportados son `title`, `description` y `position`.

---

## 5. Endpoints de la API (Catálogo Completo)

El backend expone **única y exclusivamente** estos 6 endpoints bajo el prefijo `/api/boards`:

```
Board (tablero) ──< Column (columna) ──< Ticket
```

| Método | Endpoint | Descripción | Éxito |
|---|---|---|---|
| `POST` | `/api/boards` | Crea un nuevo tablero | `201 Created` |
| `GET` | `/api/boards/:boardId` | Obtiene un tablero con sus columnas y tickets | `200 OK` |
| `POST` | `/api/boards/:boardId/columns` | Agrega una columna a un tablero | `201 Created` |
| `DELETE` | `/api/boards/:boardId/columns/:columnId` | Elimina una columna y sus tickets en cascada | `204 No Content` |
| `POST` | `/api/boards/:boardId/columns/:columnId/tickets` | Crea un ticket en una columna | `201 Created` |
| `PATCH` | `/api/boards/:boardId/columns/:columnId/tickets/:ticketId` | Mueve un ticket o actualiza sus datos | `200 OK` |

---

## 6. Especificación Detallada de cada Endpoint

### 6.1. Crear Tablero
- **Ruta:** `POST /api/boards`
- **Auth:** No
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "name": "Nombre del Tablero"
  }
  ```
  - `name`: Obligatorio. Tipo `string`. 1 a 100 caracteres.
- **Respuesta Exitosa (`201 Created`):**
  ```json
  {
    "_id": "6701a2b3c4d5e6f7a8b9c0d1",
    "name": "Nombre del Tablero",
    "createdAt": "2026-10-19T20:00:00.000Z",
    "updatedAt": "2026-10-19T20:00:00.000Z"
  }
  ```
- **Errores Posibles:**
  - `400 Bad Request`:
    - `{ "error": "El cuerpo de la petición es requerido" }`
    - `{ "error": "El nombre del tablero es requerido" }`
    - `{ "error": "El nombre no puede exceder 100 caracteres" }`

---

### 6.2. Obtener Tablero con Columnas y Tickets
- **Ruta:** `GET /api/boards/:boardId`
- **Auth:** No
- **Parámetros URL:**
  - `boardId`: ObjectId de 24 caracteres hexadecimales.
- **Body:** Ninguno
- **Respuesta Exitosa (`200 OK`):**
  Retorna el tablero con `columns` pobladas (ordenadas por `order` ascendente) y `tickets` poblados (ordenados por `position` ascendente):
  ```json
  {
    "_id": "6701a2b3c4d5e6f7a8b9c0d1",
    "name": "Nombre del Tablero",
    "columns": [
      {
        "_id": "6701a2b3c4d5e6f7a8b9c0d2",
        "name": "Por Hacer",
        "order": 1,
        "board": "6701a2b3c4d5e6f7a8b9c0d1",
        "createdAt": "2026-10-19T20:01:00.000Z",
        "updatedAt": "2026-10-19T20:01:00.000Z",
        "tickets": [
          {
            "_id": "6701a2b3c4d5e6f7a8b9c0d3",
            "title": "Diseñar vistas",
            "description": "Especificación detallada",
            "position": 0,
            "column": "6701a2b3c4d5e6f7a8b9c0d2",
            "board": "6701a2b3c4d5e6f7a8b9c0d1",
            "createdAt": "2026-10-19T20:02:00.000Z",
            "updatedAt": "2026-10-19T20:02:00.000Z",
            "__v": 0
          }
        ]
      }
    ],
    "createdAt": "2026-10-19T20:00:00.000Z",
    "updatedAt": "2026-10-19T20:00:00.000Z"
  }
  ```
- **Errores Posibles:**
  - `400 Bad Request`: `{ "error": "ID inválido" }` (si el formato de `boardId` no es 24 hex).
  - `404 Not Found`: `{ "error": "Tablero no encontrado" }` (si el ID es válido pero no existe).

---

### 6.3. Crear Columna en Tablero
- **Ruta:** `POST /api/boards/:boardId/columns`
- **Auth:** No
- **Parámetros URL:**
  - `boardId`: ObjectId de 24 caracteres hex.
- **Body:**
  ```json
  {
    "name": "En Progreso",
    "order": 2
  }
  ```
  - `name`: Obligatorio. Tipo `string`. No vacío.
  - `order`: Opcional. Tipo `number` (por defecto `0`).
- **Respuesta Exitosa (`201 Created`):**
  ```json
  {
    "_id": "6701a2b3c4d5e6f7a8b9c0d4",
    "name": "En Progreso",
    "order": 2,
    "board": "6701a2b3c4d5e6f7a8b9c0d1",
    "createdAt": "2026-10-19T20:03:00.000Z",
    "updatedAt": "2026-10-19T20:03:00.000Z"
  }
  ```
- **Errores Posibles:**
  - `400 Bad Request`:
    - `{ "error": "ID inválido" }`
    - `{ "error": "El cuerpo de la petición es requerido" }`
    - `{ "error": "El nombre de la columna es requerido" }`
    - `{ "error": "El orden debe ser un número" }`
  - `404 Not Found`: `{ "error": "Tablero no encontrado" }`

---

### 6.4. Eliminar Columna (Borrado en Cascada)
- **Ruta:** `DELETE /api/boards/:boardId/columns/:columnId`
- **Auth:** No
- **Parámetros URL:**
  - `boardId`: ObjectId de 24 caracteres hex.
  - `columnId`: ObjectId de 24 caracteres hex.
- **Body:** Ninguno
- **Respuesta Exitosa (`204 No Content`):**
  Sin cuerpo de respuesta. Todos los tickets de esta columna son eliminados automáticamente por el hook en cascada.
- **Errores Posibles:**
  - `400 Bad Request`: `{ "error": "ID inválido" }`
  - `404 Not Found`:
    - `{ "error": "Tablero no encontrado" }`
    - `{ "error": "Columna no encontrada" }` (también si la columna existe pero pertenece a otro tablero).

---

### 6.5. Crear Ticket en Columna
- **Ruta:** `POST /api/boards/:boardId/columns/:columnId/tickets`
- **Auth:** No
- **Parámetros URL:**
  - `boardId`: ObjectId de 24 caracteres hex.
  - `columnId`: ObjectId de 24 caracteres hex.
- **Body:**
  ```json
  {
    "title": "Nueva tarea",
    "description": "Detalle opcional de la tarea",
    "position": 0
  }
  ```
  - `title`: Obligatorio. Tipo `string`. No vacío.
  - `description`: Opcional. Tipo `string`.
  - `position`: Opcional. Tipo `number` (por defecto `0`).
- **Respuesta Exitosa (`201 Created`):**
  ```json
  {
    "_id": "6701a2b3c4d5e6f7a8b9c0d5",
    "title": "Nueva tarea",
    "description": "Detalle opcional de la tarea",
    "position": 0,
    "column": "6701a2b3c4d5e6f7a8b9c0d2",
    "board": "6701a2b3c4d5e6f7a8b9c0d1",
    "createdAt": "2026-10-19T20:04:00.000Z",
    "updatedAt": "2026-10-19T20:04:00.000Z",
    "__v": 0
  }
  ```
- **Errores Posibles:**
  - `400 Bad Request`:
    - `{ "error": "ID inválido" }`
    - `{ "error": "El cuerpo de la petición es requerido" }`
    - `{ "error": "El título del ticket es requerido" }`
    - `{ "error": "La descripción debe ser un texto" }`
    - `{ "error": "La posición debe ser un número" }`
  - `404 Not Found`:
    - `{ "error": "Tablero no encontrado" }`
    - `{ "error": "Columna no encontrada" }` (si no existe o si no pertenece al `boardId`).

---

### 6.6. Mover o Actualizar Ticket (Atómico e Idempotente)
- **Ruta:** `PATCH /api/boards/:boardId/columns/:columnId/tickets/:ticketId`
- **Auth:** No
- **Parámetros URL:**
  - `boardId`: ObjectId de 24 caracteres hex.
  - `columnId`: ObjectId de la columna **origen** (24 hex).
  - `ticketId`: ObjectId del ticket a modificar (24 hex).
- **Body (al menos un campo permitido):**
  ```json
  {
    "title": "Título actualizado",
    "description": "Descripción actualizada",
    "position": 1,
    "columnId": "6701a2b3c4d5e6f7a8b9c0d4"
  }
  ```
  - `title`: Opcional. Tipo `string` (no vacío si se envía).
  - `description`: Opcional. Tipo `string`.
  - `position`: Opcional. Tipo `number`.
  - `columnId`: Opcional. Tipo `string` (24 hex). Corresponde a la **columna destino** para mover el ticket. Debe pertenecer al mismo tablero.
- **Respuesta Exitosa (`200 OK`):**
  ```json
  {
    "_id": "6701a2b3c4d5e6f7a8b9c0d5",
    "title": "Título actualizado",
    "description": "Descripción actualizada",
    "position": 1,
    "column": "6701a2b3c4d5e6f7a8b9c0d4",
    "board": "6701a2b3c4d5e6f7a8b9c0d1",
    "createdAt": "2026-10-19T20:04:00.000Z",
    "updatedAt": "2026-10-19T20:05:00.000Z",
    "__v": 0
  }
  ```
- **Comportamiento Idempotente:**
  Si una petición `PATCH` se repite con los mismos datos y el ticket ya fue movido a la columna destino, responde `200 OK` con el documento actual en lugar de fallar con 404.
- **Errores Posibles:**
  - `400 Bad Request`:
    - `{ "error": "ID inválido" }`
    - `{ "error": "El cuerpo de la petición no puede estar vacío" }`
    - `{ "error": "Debe proporcionar al menos un campo válido: title, description, position, columnId" }`
    - `{ "error": "El título no puede estar vacío" }`
    - `{ "error": "La descripción debe ser un texto" }`
    - `{ "error": "La posición debe ser un número" }`
    - `{ "error": "El ID de la columna destino es inválido" }`
  - `404 Not Found`:
    - `{ "error": "Tablero no encontrado" }`
    - `{ "error": "Columna no encontrada" }`
    - `{ "error": "Ticket no encontrado en esta columna" }`
    - `{ "error": "Columna destino no encontrada en este tablero" }`
  - `409 Conflict`:
    - `{ "error": "Conflicto de concurrencia, reintenta" }` (optimistic concurrency).

---

## 7. Formato Global de Respuestas de Error

El backend garantiza que **todos los errores** (incluso los inesperados 500) se devuelven en JSON bajo la estructura:
```json
{
  "error": "Mensaje descriptivo del error"
}
```

Mapeo de códigos HTTP del backend:
- `400 Bad Request`: IDs mal formados (no 24 hex), payloads inválidos o JSON sintácticamente incorrecto.
- `404 Not Found`: Recursos no encontrados o violación de aislamiento entre tableros.
- `409 Conflict`: Error de concurrencia optimista (`VersionError`).
- `500 Internal Server Error`: `{ "error": "Error interno del servidor" }` (sin filtrar trazas internas).

---

## 8. Divergencias Críticas entre `PLAN_FRONTEND.md` y el Backend Real

Para el diseño del frontend, se deben tener en cuenta las siguientes restricciones del backend:

1. **Sin Endpoint de Lista de Tableros (`GET /api/boards`):**  
   El backend **NO** posee un endpoint para listar todos los tableros. La vista `/boards` (`BoardsListPage`) del PASO 4 necesitará una estrategia (guardar IDs de tableros creados en `localStorage`, o consultar al usuario si se permite agregar `GET /api/boards` al backend).
2. **Sin Autenticación:**  
   El backend **NO** tiene `/login`, tokens ni rutas protegidas con JWT. La vista `/login` y el hook `useAuth` del PASO 4 y PASO 10 no tendrán un endpoint real de backend contra el cual autenticar a menos que sea simulado/mockeado o se defina con el usuario.
3. **Sin Eliminación Directa de Tickets (`DELETE .../tickets/:ticketId`):**  
   El backend **NO** implementa borrado individual de tickets (solo borrado de columna en cascada `DELETE .../columns/:columnId`). El botón `onDelete` de `TicketCard` del PASO 11 requerirá consultar cómo resolverlo si no se añade al backend.
4. **Sin Campo `priority`:**  
   El modelo `Ticket` **no** tiene campo de prioridad (`priority`). Solo almacena `title`, `description` y `position`.
