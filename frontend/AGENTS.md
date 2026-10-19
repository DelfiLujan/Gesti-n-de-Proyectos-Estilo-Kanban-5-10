# AGENTS.md — Frontend DevBoard (Kanban)

## 1. Propósito del proyecto
DevBoard es una aplicación web frontend estilo Kanban moderna, reactiva y accesible para la gestión ágil de tareas y proyectos.
Permite visualizar, organizar y mover tickets a través de distintas columnas y tableros mediante una interfaz intuitiva con soporte para temas claro/oscuro y actualizaciones optimistas.

---

## 2. Fuente de la verdad
- La documentación en `../docs/BACKEND_CONTRACT.md` (y el código del backend existente) es la **ÚNICA fuente de verdad** para todos los contratos de API, modelos de datos, validaciones y comportamientos del sistema.
- Cualquier integración debe basarse estrictamente en lo documentado en `../docs/BACKEND_CONTRACT.md`.

---

## 3. Reglas de trabajo (CÓMO TRABAJAR)
- **Trabajo paso a paso:** Trabajá un paso a la vez, en orden, del PASO 0 al PASO 14.
- **Entregables únicos y validación:** Cada paso tiene un único entregable. Al terminarlo, resumí lo hecho, mostrame el resultado y lo que sigue, y ESPERÁ mi "ok" antes de avanzar.
- **Construcción incremental de AGENTS.md:** Los pasos 1 a 9 construyen el archivo `AGENTS.md` de forma incremental: en cada uno agregá SOLO la sección indicada, copiando las reglas de forma completa, sin resumirlas ni omitir detalles.
- **Fidelidad estricta al backend:** El backend es la ÚNICA fuente de verdad. NO inventes endpoints, campos ni formatos. Si algo falta o es ambiguo, preguntame.
- **Intocabilidad del backend:** NO modifiques el backend sin mi autorización (salvo ajustar CORS, previa consulta).
- **Cumplimiento de AGENTS.md:** Una vez creado `AGENTS.md`, leelo antes de cada tarea y respetalo. Si algo que te pida lo contradice, avisame.

---

## 4. Stack y entorno

| Pieza | Tecnología / Librería | Detalle / Versión |
|---|---|---|
| **Librería UI** | React | `18+` |
| **Tooling & Bundler** | Vite | Última estable |
| **Enrutamiento** | React Router DOM | `v6+` |
| **Cliente HTTP** | Axios | Última estable |
| **Manejo de Servidor & Caché** | TanStack Query (`@tanstack/react-query`) | `v5+` |
| **Formularios & Validación** | React Hook Form + Zod | `@hookform/resolvers` + `zod` |
| **Notificaciones Toast** | react-hot-toast | Última estable |
| **Estilos** | CSS Vanilla con Custom Properties | Tokens en `tokens.css` (PROHIBIDO Tailwind, Bootstrap u otras librerías CSS externas) |

### Reglas de Stack y Entorno:
- **Consumo de API:** La URL base de la API se consume **EXCLUSIVAMENTE** desde `import.meta.env.VITE_API_URL`. Queda estrictamente **PROHIBIDO** hardcodear URLs o puertos.
- **Coherencia con Backend:** La SPA se comunica con la API RESTful de Express (`http://localhost:3000` en desarrollo) enviando y recibiendo `application/json`, aprovechando la configuración de CORS existente en el backend.

---

## 5. Arquitectura y patrón de componentes

### Estructura de carpetas (`frontend/src/`):
```text
src/
├── api/        # Llamadas REST aisladas, una función por endpoint
├── components/ # UI reutilizable (Button, Input, Modal, Spinner, ...)
├── features/   # Módulos por dominio: boards, columns, tickets
├── hooks/      # Custom hooks de lógica reusable (useAuth, ...)
├── pages/      # Vistas asociadas a rutas
├── routes/     # Configuración de React Router (incluye ruta protegida)
└── styles/     # tokens.css
```

### Patrón de componentes con separación estricta:
- **Componentes Presentacionales (tontos):**
  - Solo reciben `props` y renderizan UI.
  - **PROHIBIDO:** Uso de `useEffect`, `fetch`, llamadas a API o lógica de negocio en estos componentes.
- **Páginas / Contenedores:**
  - Manejan el estado, las llamadas a la API (vía hooks y servicios) y la lógica de negocio.
  - Pasan datos y callbacks hacia los componentes presentacionales.
- **Principio anti-bloat:**
  - **PROHIBIDO** crear componentes gigantes que mezclen UI con llamadas a API (`fetch`/axios).

---

## 6. Rutas y navegación (SPA)

### Matriz de Rutas:

| Ruta | Componente | Acceso | Descripción |
|---|---|---|---|
| `/login` | `LoginPage` | Público | Formulario de autenticación |
| `/boards` | `BoardsListPage` | Protegido | Lista de tableros del usuario |
| `/boards/:boardId` | `BoardDetailPage` | Protegido | Vista principal Kanban: columnas y tickets anidados |

### Reglas de Navegación:
- **Separación entre navegación y mutación:** **NO** uses `<Link>` para acciones de mutación (crear, borrar, mover tickets). Los `<Link>` son exclusivamente para navegación estática o declarativa.
- **Navegación programática condicional:** Usá navegación programática (`useNavigate`) únicamente **después** de que la mutación en la API haya sido exitosa.
- **Control de acceso y redirección:** Sin sesión o ante un error `401 Unauthorized`, redirigir inmediatamente a `/login`.
- **Resolución de protección:** Las rutas protegidas se resuelven mediante un componente dedicado de ruta protegida ubicado en `src/routes/` (ej. `ProtectedRoute.jsx`).

---

## 7. Formularios, validaciones y feedback de carga

### Stack de Formularios:
- Implementación con **React Hook Form** + **Zod** (`@hookform/resolvers/zod`).
- **Fidelidad al Contrato:** Los esquemas de Zod reflejan con exactitud las validaciones **REALES** del backend especificadas en `../docs/BACKEND_CONTRACT.md`:
  - **Board Schema:** `name` string requerido, 1 a 100 caracteres tras trim.
  - **Column Schema:** `name` string requerido, no vacío tras trim; `order` numérico opcional (default 0).
  - **Ticket Schema (creación):** `title` string requerido, no vacío tras trim; `description` string opcional; `position` numérico opcional (default 0).
  - **Ticket Schema (actualización/movimiento):** requiere al menos uno de: `title` (string no vacío tras trim), `description` (string), `position` (number), `columnId` (string con formato regex de 24 caracteres hex).

### Validación en Cliente y Servidor:
- **Validación previa:** Validación sincrónica en el cliente antes del envío mediante el resolver de Zod.
- **Mapeo de errores del backend:** Los errores devueltos por la API (ej. `400 Bad Request` con `{ error: "..." }`) se capturan y se vinculan a los inputs correspondientes usando `setError` de React Hook Form, mostrándose como mensajes de alerta visuales debajo del campo afectado sin recargar la página.
- **Errores no atribuibles a campos:** Si el error no corresponde a un input específico (ej. error 500, colisión 409 o fallo de red), se notifica al usuario mediante un Toast de error (`react-hot-toast`).

### Estados de Carga y Feedback Visual:
- **Bloqueo de envío:** Todo formulario o botón que dispare una mutación (`POST`, `PATCH`, `DELETE`) debe inhabilitarse inmediatamente con `disabled={isSubmitting || isPending}` para prevenir envíos duplicados.
- **Indicador de progreso:** Mostrar un componente `Spinner` visible dentro o junto al botón de envío mientras la petición asíncrona esté en curso.

---

## 8. UI optimista y sincronización

### Actualización Optimista (Movimiento de Tickets):
- **Endpoint del Contrato:** `PATCH /api/boards/:boardId/columns/:columnId/tickets/:ticketId` enviando en el body `{ columnId: destColumnId, position: newPosition }`.
- **Estrategia con TanStack Query (`onMutate`):**
  - Al iniciar el arrastre/movimiento del ticket hacia otra columna o posición, aplicar inmediatamente la actualización en la caché local del tablero (`queryClient.setQueryData(['board', boardId], ...)`).
  - Cancelar previamente cualquier refetch activo sobre dicho tablero con `queryClient.cancelQueries({ queryKey: ['board', boardId] })`.
  - Capturar y retornar un snapshot del estado anterior (`previousBoard`) en el contexto de la mutación.
- **Rollback ante Fallos (`onError`):**
  - Si el backend responde con error (ej. `400 Bad Request` por columna inválida, `404 Not Found` por aislamiento de tablero, `409 Conflict` por concurrencia o fallo de red):
    1. Revertir inmediatamente el estado local al snapshot previo (`queryClient.setQueryData(['board', boardId], context.previousBoard)`), regresando el ticket a su columna y posición original.
    2. Notificar al usuario mediante un Toast de error descriptivo (`react-hot-toast`).
- **Sincronización Definitiva (`onSettled`):**
  - Invalidar la consulta del tablero (`queryClient.invalidateQueries({ queryKey: ['board', boardId] })`) para sincronizar el estado final exacto emitido por la base de datos de MongoDB.

### Mutaciones Estándar (Sin actualización optimista):
- El resto de las operaciones de mutación (creación de tableros, creación de columnas, creación de tickets, edición de texto y eliminación de columnas):
  - Siguen el flujo estándar: esperan la respuesta exitosa de la API antes de refrescar o actualizar el estado de la UI (vía `invalidateQueries` o redirección programática).

---

## 9. Estilo visual

### Enfoque de Diseño: **Modern SaaS** (vibrante y accesible)
- Bordes redondeados estandarizados entre `8px` y `12px`.
- Botones de acción principal (CTA) con colores de acento vibrantes.
- Alto contraste cumpliendo con los estándares de accesibilidad **WCAG AA**.
- **PROHIBIDO** el uso de colores hexadecimales hardcodeados dentro del JSX o componentes de React. Toda referencia a color debe consumir las variables CSS de los tokens.

### Paleta de Colores y Tokens:
Los tokens residen exclusivamente en `src/styles/tokens.css`.

| Token CSS | Modo Claro (`:root`) | Modo Oscuro (`.dark`) | Uso |
|---|---|---|---|
| `--bg-primary` | `#FAFAFA` | `#121212` | Fondo principal de la aplicación |
| `--bg-card` | `#FFFFFF` | `#1E1E1E` | Fondo de tableros, columnas y tarjetas |
| `--border-color` | `#E2E8F0` | `#333333` | Bordes sutiles de contenedores y cards |
| `--text-primary` | `#2D3748` | `#E0E0E0` | Tipografía principal y títulos |
| `--accent-primary` | `#00B8D9` (Cian) | `#33E1ED` (Cian neón) | Botones primarios, enlaces activos |
| `--accent-secondary`| `#6554C0` (Púrpura) | `#9F8DF1` (Púrpura claro) | Badges, elementos secundarios |
| `--shadow-card` | `0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)` | `none` (borde sutil) | Elevación de tarjetas y modales |

---

## 10. Theme Switch (Claro / Oscuro)

### Requerimientos de Implementación:
1. **Detección Automática del Sistema:**
   - Si el usuario no ha seleccionado un tema manualmente, el valor inicial se detecta automáticamente evaluando `window.matchMedia('(prefers-color-scheme: dark)').matches`.
2. **Persistencia en LocalStorage:**
   - La elección explícita del usuario (`light` o `dark`) se almacena bajo una clave en `localStorage` (ej. `devboard-theme`) para persistir entre sesiones y recargas de página.
3. **Componente `ThemeToggle`:**
   - Componente presentacional/controlador accesible que conmuta la clase `.dark` en el elemento raíz `<html>` (`document.documentElement.classList.toggle('dark')`).
4. **Prevención de Parpadeo de Estilos (Anti-FOUC):**
   - Inclusión obligatoria de un script síncrono inline dentro del `<head>` de `index.html` (antes del montaje de React y antes de cualquier CSS dependiente) que lee `localStorage` o `matchMedia` y aplica de inmediato la clase `dark` a `<html>` si corresponde.

---

## 11. Mocks y workflow de desarrollo

### Mocks de Datos (`src/api/mockData.js`):
- Para permitir el desarrollo ágil de la interfaz visual sin depender de una base de datos activa ni del servidor backend corriendo, se provee `src/api/mockData.js`.
- **Fidelidad Estricta:** Las estructuras mockeadas deben reproducir **EXACTAMENTE** las respuestas del backend real documentadas en `../docs/BACKEND_CONTRACT.md`:
  - Identificadores ObjectId de 24 caracteres hexadecimales.
  - Propiedades `_id`, `name`, `columns`, `tickets`, `title`, `description`, `position`, `board`, `column`, `createdAt`, `updatedAt`, `__v`.
  - Sin campos inventados (sin `priority`, sin endpoints inexistentes).

### Configuración del Entorno y API:
- La API base se consume de forma exclusiva a través de la variable de entorno `import.meta.env.VITE_API_URL`.
- En desarrollo local apunta a `http://localhost:3000`.
- En producción apuntará al dominio del backend desplegado (Render/Railway), sin tocar el código fuente.

### Workflow para Levantar el Backend Local:
1. **Prerrequisitos:**
   - Node.js versión `>= 20.x LTS`.
   - Servicio de base de datos **MongoDB** en ejecución localmente (`mongodb://127.0.0.1:27017`) o un clúster de **MongoDB Atlas**.
2. **Configuración de variables de entorno:**
   - En la raíz del repositorio (`./`), asegurar la existencia del archivo `.env`:
     ```env
     PORT=3000
     MONGODB_URI=mongodb://127.0.0.1:27017/kanban_db
     NODE_ENV=development
     ```
3. **Instalación y ejecución del backend:**
   ```bash
   # Desde la raíz del repositorio:
   npm install
   npm run dev
   ```
   El servidor arrancará en `http://localhost:3000` con recarga automática por `nodemon`.

### Workflow para Levantar el Frontend Local:
1. **Configuración de variables de entorno:**
   - En la carpeta `frontend/`, asegurar el archivo `.env`:
     ```env
     VITE_API_URL=http://localhost:3000
     ```
2. **Instalación y ejecución del frontend:**
   ```bash
   # Desde la carpeta frontend/:
   npm install
   npm run dev
   ```
   Vite expondrá la aplicación localmente en `http://localhost:5173`.

---

## 12. Fases de implementación (Checklist Pasos 10 a 14)

- [x] **Paso 10: Capa de servicio API (sin UI)**
  - Implementar clientes HTTP con Axios en `src/api` (`boardService.js`, `columnService.js`, `ticketService.js`, `apiClient.js`).
  - Consumir `baseURL` estrictamente desde `import.meta.env.VITE_API_URL`.
  - Configurar interceptores de error para propagar `{ error: message }` respetando el formato del backend.
  - Implementar un método por cada uno de los 6 endpoints reales del contrato; ninguno inventado y sin interfaz gráfica.

- [x] **Paso 11: Componentes atómicos de UI, tokens y Theme Switch**
  - Construir la biblioteca de componentes tontos/presentacionales sin acoplamiento a la API: `Button`, `Input`, `Modal`, `Spinner`, `ThemeToggle`, `TicketCard`, `ColumnHeader`.
  - Implementar el diseño Modern SaaS con `src/styles/tokens.css` (variables CSS `:root` y `.dark`).
  - Implementar el Theme Switch completo (detección del sistema, persistencia en `localStorage`, alternancia de clase `.dark` y script inline anti-FOUC en `index.html`).
  - Crear `src/api/mockData.js` y verificar el renderizado de los componentes con datos sintéticos.

- [ ] **Paso 12: Integración de vistas y rutas**
  - Ensamblar las páginas: `LoginPage`, `BoardsListPage` y `BoardDetailPage` (esta última con `useParams` para `:boardId` y estados de carga/error/datos).
  - Configurar React Router DOM en `src/routes/` con resolución de ruta protegida.
  - Implementar formularios con React Hook Form + Zod reflejando el contrato y mapeo de errores con `setError`.
  - Aplicar UI optimista con TanStack Query al mover tickets entre columnas y rollback ante errores.
  - Probar el flujo completo e integral contra el backend real en ejecución.

- [ ] **Paso 13: Documentación (front y back)**
  - Redactar `frontend/README.md`: decisiones de arquitectura, librerías, estructura modular, tokens y diseño, manejo de estado y UI optimista, integración con la API, variables de entorno y comandos para correr/compilar.
  - Generar o actualizar documentación del backend (solicitando confirmación previa antes de modificar archivos del backend).

- [ ] **Paso 14: Verificación y despliegue**
  - Validar que `npm run build` en el frontend termine con cero errores de compilación o linter.
  - Validar toda la funcionalidad de la app contra el backend real (tableros, columnas, tickets, drag & drop / movimiento, theme switch).
  - Elaborar la guía de despliegue para frontend y backend (Render / Railway / Vercel), detallando configuración de CORS y `VITE_API_URL`.
  - Ejecutar y documentar el checklist de verificación post-despliegue.

---

## 13. Reglas generales

1. **Responsabilidad Única y Código Limpio:**
   - Mantener componentes pequeños, cohesivos y declarativos.
   - **PROHIBIDO** crear componentes monolíticos o gigantes que mezclen renderizado de UI compleja con lógica de fetching a la API.
2. **Prioridad Absoluta del Contrato:**
   - Ante cualquier duda, ambigüedad o discrepancia en modelos, endpoints o códigos de estado:
     1. Consultar `../docs/BACKEND_CONTRACT.md`.
     2. Revisar el código fuente del backend.
     3. Consultar y preguntar al usuario antes de inventar o asumir soluciones.
3. **Flujo de Trabajo Disciplinado:**
   - Trabajar rigurosamente un paso a la vez.
   - Al cerrar cada paso: resumir lo hecho, mostrar el resultado, indicar lo que sigue y **esperar el "ok" explícito del usuario** antes de escribir código del siguiente paso.








