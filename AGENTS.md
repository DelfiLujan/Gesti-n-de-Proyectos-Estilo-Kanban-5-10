# AGENTS.md — API REST Kanban (Tableros → Columnas → Tickets)

> Este archivo es la **fuente de la verdad** del proyecto. Léelo completo antes de escribir código.
> Si una instrucción del usuario contradice este archivo, **avisa y pregunta** antes de continuar.

---

## 1. Objetivo del proyecto

Backend de una aplicación estilo Kanban. Expone una API RESTful con **rutas anidadas** que reflejan la jerarquía Padre-Hijo-Nieto:

```
Board (tablero) ──< Column (columna) ──< Ticket
```

- No se implementa autenticación en esta etapa (**NO** agregar JWT, sesiones ni login).
- Todo ticket nace dentro del contexto de una columna y un tablero.

---

## 2. Stack estricto

| Pieza | Versión / Librería |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | Express 4.x |
| Base de datos | MongoDB + Mongoose 8.x |
| Configuración | `dotenv` |
| Módulos | CommonJS (`require`) — no mezclar con ESM |
| Utilidades permitidas | `cors`, `morgan`, `helmet` |
| Dev | `nodemon` |

**Reglas del stack:**
- NO agregar dependencias nuevas sin justificarlas y pedir confirmación.
- NO usar Express 5, TypeScript, Prisma, Sequelize ni otro ORM/ODM.
- NO usar librerías de validación externas (Joi, Zod, etc.) salvo que el usuario lo apruebe; usar validación de esquema de Mongoose + middlewares propios.

---

## 3. Estructura del proyecto

```
.
├── AGENTS.md
├── README.md
├── .env.example
├── .gitignore
├── package.json
├── thunder-collection.json        # se genera PRIMERO (ver sección 9)
└── src/
    ├── server.js                  # arranque: conecta DB y levanta el servidor
    ├── app.js                     # configura Express, middlewares y rutas
    ├── config/
    │   └── db.js                  # conexión a MongoDB
    ├── models/
    │   ├── Board.js
    │   ├── Column.js
    │   └── Ticket.js
    ├── controllers/
    │   ├── board.controller.js
    │   ├── column.controller.js
    │   └── ticket.controller.js
    ├── routes/
    │   ├── board.routes.js
    │   ├── column.routes.js
    │   └── ticket.routes.js
    ├── middlewares/
    │   ├── validateObjectId.js    # formato de IDs (24 hex)
    │   ├── loadBoard.js           # Parent Check: tablero existe
    │   ├── loadColumn.js          # Parent Check + aislamiento: columna existe y pertenece al tablero
    │   ├── validateBody.js        # validación de payloads
    │   ├── notFound.js            # 404 para rutas inexistentes
    │   └── errorHandler.js        # manejador global de errores
    └── utils/
        └── AppError.js            # error con statusCode
```

---

## 4. Patrones de diseño obligatorios

1. **Responsabilidad Única (SRP):**
   - **Modelos** → esquema, validaciones de datos, hooks (cascada).
   - **Controladores** → lógica de la petición/respuesta.
   - **Rutas** → solo mapean método + path → middlewares + controlador.
   - **Middlewares** → validaciones transversales (IDs, parent check, aislamiento).
2. **Rutas anidadas con `Router({ mergeParams: true })`** para que los routers hijos reciban `boardId` y `columnId`.
3. **Controladores finos y async:** envolver con un helper `asyncHandler` (o `try/catch` + `next(err)`). Nunca dejar una promesa sin capturar.
4. **Errores centralizados:** los controladores y middlewares lanzan `AppError(statusCode, mensaje)` o llaman a `next(err)`; solo `errorHandler.js` escribe la respuesta de error.
5. **Códigos de estado y constantes** en un solo lugar; sin números mágicos repetidos.

---

## 5. Contrato de la API (fuente de la verdad)

El sistema expone **exactamente** estas rutas. No agregar, renombrar ni omitir ninguna.

| Método | Endpoint | Acción | Éxito |
|---|---|---|---|
| POST | `/api/boards` | Crea un nuevo tablero | `201 Created` |
| GET | `/api/boards/:boardId` | Obtiene un tablero con sus columnas pobladas | `200 OK` |
| POST | `/api/boards/:boardId/columns` | Agrega una columna a un tablero | `201 Created` |
| DELETE | `/api/boards/:boardId/columns/:columnId` | Elimina una columna | `204 No Content` |
| POST | `/api/boards/:boardId/columns/:columnId/tickets` | Crea un ticket dentro de una columna | `201 Created` |
| PATCH | `/api/boards/:boardId/columns/:columnId/tickets/:ticketId` | Mueve un ticket o actualiza su contenido | `200 OK` |

**Prohibido:** rutas planas como `/api/tickets` o `/api/columns` para crear recursos.
**NO** implementar endpoints extra (ej. `GET /api/boards`, `DELETE /api/boards/:id`, `PUT`) salvo pedido explícito del usuario.

### Contratos de payload sugeridos

- `POST /api/boards` → `{ "name": "string (requerido, 1–100 chars)" }`
- `POST /api/boards/:boardId/columns` → `{ "name": "string (requerido)", "order": number (opcional) }`
- `POST .../tickets` → `{ "title": "string (requerido)", "description": "string (opcional)", "position": number (opcional) }`
- `PATCH .../tickets/:ticketId` → al menos uno de: `title`, `description`, `position`, `columnId` (columna **destino** para mover el ticket).

### Forma de las respuestas

- Éxito: el recurso en JSON (excepto `204`, que no lleva cuerpo).
- `GET /api/boards/:boardId`: el tablero con `columns` pobladas (usar `populate` / virtual populate). Opcionalmente incluir los tickets de cada columna, pero **sin embeber arrays de tickets en el documento de la columna** (ver sección 8).
- Error: **siempre** `{ "error": "mensaje descriptivo" }`.

---

## 6. Modelos (Mongoose 8)

Un archivo por modelo, con referencias (`ref`) explícitas y `timestamps: true`.

**Board.js**
- `name` (String, requerido, trim).
- Virtual `columns` (`ref: 'Column'`, `localField: '_id'`, `foreignField: 'board'`) para poblar columnas. Activar `toJSON: { virtuals: true }`.

**Column.js**
- `name` (String, requerido, trim).
- `board` (ObjectId, `ref: 'Board'`, requerido, con índice).
- `order` (Number, default 0).

**Ticket.js**
- `title` (String, requerido, trim, no vacío).
- `description` (String, opcional).
- `column` (ObjectId, `ref: 'Column'`, requerido, con índice).
- `board` (ObjectId, `ref: 'Board'`, requerido, con índice) — desnormalizado para validar aislamiento y facilitar el borrado en cascada.
- `position` (Number, default 0).
- Opciones del esquema: `{ timestamps: true, optimisticConcurrency: true }`.

### Borrado en cascada (hooks de Mongoose)

Al eliminar:
- **Tablero** → eliminar sus columnas y los tickets de esas columnas.
- **Columna** → eliminar los tickets de esa columna.

Implementar con `schema.pre('deleteOne', { document: true, query: false }, async function () { ... })` en `Board.js` y `Column.js`.
Los controladores deben eliminar usando la **instancia del documento** (`const doc = await Model.findOne(...); await doc.deleteOne();`) para que el hook se dispare.

---

## 7. Reglas de negocio y validaciones

### 7.1 Parent Check (verificación estricta de existencia)
- **Antes** de crear una columna: consultar a la DB si `boardId` existe. Si no → abortar y responder `404`.
- **Antes** de crear un ticket: verificar que `columnId` existe (y que su tablero existe). Si no → `404`.
- Esta verificación vive en middlewares (`loadBoard`, `loadColumn`), **no** en las rutas ni duplicada en cada controlador.

### 7.2 Aislamiento de rutas
- Para cualquier ruta con `:boardId` y `:columnId`, el middleware `loadColumn` debe comprobar que `column.board` **es igual** a `boardId`.
- Si la columna existe pero pertenece a otro tablero → rechazar con **`404 Not Found`** (decisión del proyecto; no filtrar la existencia de recursos de otros tableros).
- Para `PATCH .../tickets/:ticketId`: el ticket debe pertenecer a la `columnId` de la URL; si no → `404`.

### 7.3 Respuestas HTTP semánticas

| Situación | Código |
|---|---|
| Payload inválido (ej. falta `title`, tipo incorrecto, body vacío en PATCH) | `400 Bad Request` |
| ID con formato inválido (no es 24 caracteres hexadecimales) | `400 Bad Request` |
| ID válido en formato pero inexistente en la DB | `404 Not Found` |
| Columna/ticket que no pertenece al padre indicado en la URL | `404 Not Found` |
| Ruta inexistente | `404 Not Found` |
| Error inesperado del servidor | `500` con `{ "error": "Error interno del servidor" }` (sin stack ni detalles internos) |

### 7.4 Validación de IDs
- Middleware `validateObjectId` que valide cada parámetro (`boardId`, `columnId`, `ticketId`) con la regex `/^[0-9a-fA-F]{24}$/`.
- **NO** usar `mongoose.isValidObjectId` como única validación (acepta strings de 12 caracteres).
- Orden de middlewares: `validateObjectId` → `loadBoard` → `loadColumn` → `validateBody` → controlador.
- Como red de seguridad, `errorHandler` debe capturar `CastError` (→ 400) y `ValidationError` (→ 400, con mensaje legible).

---

## 8. Límites negativos (NO hacer)

- **NO** devuelvas un `500` genérico si `boardId`/`columnId` no existe: valida y responde `404`.
- **NO** dejes que un `CastError` o `ValidationError` de Mongoose llegue como `500`.
- **NO** uses `findByIdAndDelete`, `findOneAndDelete`, `deleteMany` ni `Model.deleteOne()` (a nivel query) para borrar tableros o columnas: no disparan los hooks de documento y rompen la cascada. Usa `doc.deleteOne()`.
- **NO** anides tickets como array dentro de las columnas. Usa **referencias (ObjectId)**: el ticket guarda `column` y `board`.
- **NO** pongas lógica de base de datos (queries de Mongoose) en los archivos de rutas.
- **NO** mezcles responsabilidades: un controlador no define esquemas; un modelo no conoce `req`/`res`.
- **NO** crees rutas planas (`/api/tickets`) ni endpoints no listados en la sección 5.
- **NO** implementes autenticación/autorización en esta etapa.
- **NO** hardcodees credenciales, URIs ni puertos: todo va en variables de entorno.
- **NO** subas `.env` al repositorio; solo `.env.example`.
- **NO** uses `console.log` para manejar errores en producción; usa `errorHandler` (y `morgan` para logs HTTP).
- **NO** devuelvas stack traces ni mensajes internos de Mongoose al cliente.
- **NO** generes los tres modelos + controladores + rutas en un solo paso (ver sección 10).
- **NO** instales dependencias ni cambies versiones sin avisar.

---

## 9. Pruebas y contratos primero

Antes de escribir lógica de negocio:

1. **Genera `thunder-collection.json`** (formato Thunder Client) con una petición por cada fila del contrato (sección 5) **más** los casos de error:
   - Crear tablero sin `name` → `400`.
   - `GET` con `boardId` mal formado (`abc`) → `400`.
   - `GET` con `boardId` válido inexistente (`64b7f0a2c9e77a0012345678`) → `404`.
   - Crear columna en tablero inexistente → `404`.
   - Crear ticket sin `title` → `400`.
   - Crear ticket en columna inexistente → `404`.
   - Acceder a `/boards/A/columns/{columna de B}/tickets` → `404` (aislamiento).
   - `DELETE` de columna → `204`; luego verificar que sus tickets ya no existen (cascada).
   - `PATCH` mover ticket a otra columna del mismo tablero → `200`.
   - `PATCH` mover ticket a columna de **otro** tablero → `404`/`400`.
   - `PATCH` repetido dos veces con el mismo body → mismo resultado (idempotencia).
2. Cada petición debe incluir **tests/asserts** de código de estado y forma del cuerpo (`{ error }` en fallos).
3. Itera sobre el código hasta que **todas las peticiones pasen en verde**.

---

## 10. Partición generativa (trabajar por fases)

Ejecuta **una fase por vez**. Al terminar cada fase: resume lo hecho, indica cómo probarlo y **espera la validación del usuario** antes de continuar.

| Fase | Entregable | Validación |
|---|---|---|
| 0 | Esqueleto: `package.json`, `app.js`, `server.js`, `config/db.js`, `.env.example`, `errorHandler`, `notFound`, `AppError`, `thunder-collection.json` | El servidor levanta y conecta a Mongo |
| 1 — Datos | Solo los esquemas `Board.js`, `Column.js`, `Ticket.js` con referencias y hooks `pre('deleteOne')` para cascada | Revisión de esquemas e índices |
| 2 — Validación | Middlewares `validateObjectId`, `loadBoard`, `loadColumn` (Parent Check + aislamiento), `validateBody` | Pruebas de 400/404 |
| 3 — Controladores y rutas | Boards → Columns → Tickets, en ese orden, usando los modelos y middlewares existentes | Colección Thunder en verde por recurso |
| 4 — Cierre | README completo, revisión de límites negativos, pruebas finales, guía de despliegue | Checklist de la sección 12 |

No avances a la siguiente fase sin confirmación. Si falta contexto, pregunta; no inventes.

---

## 11. Idempotencia y concurrencia

Especialmente en `PATCH .../tickets/:ticketId`:

- **Idempotente:** enviar la misma petición dos veces (ej. por un fallo de red) debe dejar la base de datos en el mismo estado final, sin duplicar datos ni corromper el orden.
- Usar **valores absolutos** (`$set`), nunca operaciones relativas (`$inc`, `$push`) para `column`, `position`, `title`, `description`.
- Si el ticket ya está en la columna destino con los mismos valores, responder `200` con el estado actual (no error, no duplicado).
- Mover = **actualizar el campo `column`** del mismo documento. **NUNCA** crear un ticket nuevo ni borrar+crear.
- Validar que la columna destino (`columnId` del body) exista **y pertenezca al mismo tablero**; si no → `404` (o `400` si el formato es inválido).
- Aplicar el cambio con una **operación atómica** (`findOneAndUpdate` con filtro `{ _id, column: columnIdOrigen, board: boardId }` y `{ new: true, runValidators: true }`) para evitar condiciones de carrera entre lectura y escritura.
- El esquema de `Ticket` usa `optimisticConcurrency: true`; ante un `VersionError` responder `409 Conflict` con `{ error: "..." }`.
- Reordenamiento: la `position` se asigna como valor explícito enviado por el cliente; no recalcular posiciones de otros tickets de forma no determinista.

---

## 12. Manejo de errores global

`errorHandler.js` (último middleware de `app.js`) mapea:

| Error | Respuesta |
|---|---|
| `AppError` | `statusCode` propio + `{ error: message }` |
| `CastError` | `400` `{ error: "ID inválido" }` |
| `ValidationError` (Mongoose) | `400` `{ error: "<mensajes de validación>" }` |
| `VersionError` | `409` `{ error: "Conflicto de concurrencia, reintenta" }` |
| JSON malformado (`SyntaxError` de `express.json`) | `400` `{ error: "JSON inválido" }` |
| Cualquier otro | `500` `{ error: "Error interno del servidor" }` |

Todas las respuestas de fallo usan **exactamente** el formato `{ "error": "mensaje" }`.

---

## 13. Entregables y convenciones del repositorio

- [ ] Repositorio **público** en Git.
- [ ] **Conventional Commits** (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`). Commits pequeños, uno por fase/unidad lógica. Ejemplos:
  - `feat(models): add Board, Column and Ticket schemas with cascade hooks`
  - `feat(middlewares): add parent check and route isolation`
  - `docs: add README and AGENTS.md`
- [ ] `README.md` completo: descripción, stack, instalación, variables de entorno, scripts, tabla de endpoints con ejemplos de request/response, reglas de negocio, cómo correr las pruebas Thunder Client y URL del despliegue (si existe).
- [ ] `.env.example` con `PORT`, `MONGODB_URI` y `NODE_ENV` (sin valores reales).
- [ ] `.gitignore` con `node_modules/` y `.env`.
- [ ] Modelos en archivos separados: `Board.js`, `Column.js`, `Ticket.js`.
- [ ] Controladores y rutas en módulos separados (SRP).
- [ ] `thunder-collection.json` versionado en el repo.
- [ ] Evidencia de pruebas (capturas o video con Postman/Thunder Client).
- [ ] *(Valorado)* Despliegue del backend (Render, Railway, Fly.io o similar) con MongoDB Atlas, variables de entorno configuradas en la plataforma.

---

## 14. Definición de "terminado" (checklist final)

- [ ] Las 6 rutas del contrato responden con el código de éxito indicado.
- [ ] Crear columna con `boardId` inexistente → `404` (no `500`).
- [ ] Crear ticket con `columnId` inexistente → `404`.
- [ ] Columna de otro tablero accedida desde la URL de un tablero distinto → `404`.
- [ ] Payload inválido → `400`; ID mal formado → `400`; ID inexistente → `404`.
- [ ] Borrar una columna elimina sus tickets; borrar un tablero elimina columnas y tickets (verificado).
- [ ] `PATCH` de ticket idempotente y sin duplicados.
- [ ] Todas las respuestas de error tienen forma `{ "error": "..." }`.
- [ ] Ninguna ruta contiene lógica de DB; ningún borrado usa `findByIdAndDelete`.
- [ ] Toda la colección de Thunder Client pasa en verde.
- [ ] README, `.env.example` y commits convencionales completos.

---

## 15. Cómo trabajar conmigo (instrucciones al agente)

1. Lee este archivo al inicio de cada sesión.
2. Trabaja **por fases** (sección 10) y confirma antes de avanzar.
3. Antes de modificar archivos existentes, léelos; no sobrescribas trabajo ya validado.
4. Si algo es ambiguo o contradice este documento, **pregunta** en lugar de asumir.
5. Al terminar cada fase, entrega: archivos creados/modificados, cómo probarlos y qué falta.
6. Escribe código y mensajes de error en un estilo consistente (nombres de variables en inglés; mensajes de error al cliente en español).
