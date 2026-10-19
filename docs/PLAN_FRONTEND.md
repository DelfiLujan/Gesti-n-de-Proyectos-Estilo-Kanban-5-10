Actuá como Ingeniero Frontend Senior. Construí el frontend de DevBoard (Kanban) con Desarrollo Basado en Especificaciones (SDD), integrado con el backend YA REALIZADO en este repositorio.

# CÓMO TRABAJAR (aplica a TODOS los pasos)
- Trabajá un paso a la vez, en orden, del PASO 0 al PASO 14.
- Cada paso tiene un único entregable. Al terminarlo, resumí lo hecho, mostrame el resultado y lo que sigue, y ESPERÁ mi "ok" antes de avanzar.
- Los pasos 1 a 9 construyen el archivo AGENTS.md de forma incremental: en cada uno agregá SOLO la sección indicada, copiando las reglas de forma completa, sin resumirlas ni omitir detalles.
- El backend es la ÚNICA fuente de verdad. NO inventes endpoints, campos ni formatos. Si algo falta o es ambiguo, preguntame.
- NO modifiques el backend sin mi autorización (salvo ajustar CORS, previa consulta).
- Una vez creado AGENTS.md, leelo antes de cada tarea y respetalo. Si algo que te pida lo contradice, avisame.

---

# PASO 0: Analizar el backend (antes de escribir código)
Revisá el código y la documentación del backend y generá `docs/BACKEND_CONTRACT.md` con:
- Endpoints: método, ruta, auth requerida, body, respuestas y errores con su formato.
- Mecanismo de autenticación (tipo de token, header, expiración, qué pasa con 401).
- Modelos: board, column, ticket, y valores válidos de priority.
- Validaciones de negocio (campos obligatorios, largos, duplicados, etc.).
- Puerto local y configuración de CORS.
- Stack del backend (lenguaje, framework, base de datos).

Mostrámelo para validar. No avances sin mi "ok".

# PASO 1: AGENTS.md — Base y reglas de trabajo
Creá `AGENTS.md` en la raíz del frontend con:
- Propósito del proyecto (DevBoard, frontend Kanban) en 2-3 líneas.
- Referencia obligatoria a `docs/BACKEND_CONTRACT.md` como única fuente de verdad.
- Las reglas de la sección "CÓMO TRABAJAR" de este documento: leer AGENTS.md antes de cada tarea, no inventar endpoints/campos/formatos, preguntar ante ambigüedades, no modificar el backend sin autorización (salvo CORS, previa consulta), avisar si un pedido contradice el archivo, resumir al cerrar cada paso y esperar el "ok".

# PASO 2: AGENTS.md — Stack y entorno, e inicialización del proyecto
Agregá la sección STACK a AGENTS.md:
- React 18+, Vite, React Router DOM v6+, Axios + TanStack Query, React Hook Form + Zod, react-hot-toast, CSS propio con Custom Properties (sin Tailwind ni Bootstrap).
- Confirmá que el stack sea coherente con el del backend (revisá lo documentado en BACKEND_CONTRACT.md). Si hay incoherencias, avisame antes de seguir.
- La URL de la API se consume SOLO desde `import.meta.env.VITE_API_URL`. Nunca hardcodeada.

Luego inicializá el proyecto con Vite + React, instalá las dependencias del stack y creá `.env.example` con `VITE_API_URL` apuntando al puerto local detectado en el PASO 0.

# PASO 3: AGENTS.md — Arquitectura y patrón de componentes
Agregá la sección ARQUITECTURA a AGENTS.md y creá la estructura de carpetas vacía:
```
src/
├── api/        # Llamadas REST aisladas, una función por endpoint
├── components/ # UI reutilizable (Button, Input, Modal, Spinner, ...)
├── features/   # Módulos por dominio: boards, columns, tickets
├── hooks/      # Custom hooks de lógica reusable (useAuth, ...)
├── pages/      # Vistas asociadas a rutas
├── routes/     # Configuración de React Router (incluye ruta protegida)
└── styles/     # tokens.css
```
Patrón de componentes, con separación estricta:
- Presentacionales (tontos): solo reciben props y renderizan UI. PROHIBIDO useEffect, fetch/llamadas a API o lógica de negocio.
- Páginas/Contenedores: manejan estado, llamadas a la API y lógica.
- Prohibido crear componentes gigantes que mezclen UI con fetch.

# PASO 4: AGENTS.md — Rutas y navegación (SPA)
Agregá la sección RUTAS a AGENTS.md con esta matriz:

| Ruta | Componente | Acceso | Descripción |
|---|---|---|---|
| /login | LoginPage | Público | Formulario de autenticación |
| /boards | BoardsListPage | Protegido | Lista de tableros del usuario |
| /boards/:boardId | BoardDetailPage | Protegido | Vista principal Kanban: columnas y tickets anidados |

Reglas:
- NO uses `<Link>` para acciones de mutación (crear, borrar, mover tickets).
- Usá navegación programática (`useNavigate`) únicamente después de que la mutación en la API haya sido exitosa.
- Sin sesión o ante un 401, redirigir a /login.
- Las rutas protegidas se resuelven con un componente de ruta protegida en `src/routes/`.

# PASO 5: AGENTS.md — Formularios, validaciones y feedback de carga
Agregá la sección FORMULARIOS a AGENTS.md:
- React Hook Form + Zod. Los esquemas Zod reflejan las validaciones REALES del backend (según BACKEND_CONTRACT.md).
- Validación en cliente y en servidor: los errores devueltos por el backend (ej. 400 por título duplicado) se mapean a los inputs correspondientes con `setError`, mostrándose como alertas visuales del campo, sin recargar la página.
- Estados de carga: todo formulario que haga POST, PATCH o DELETE debe tener el botón de envío con `disabled={isSubmitting}` y mostrar un spinner mientras la petición esté en curso.

# PASO 6: AGENTS.md — UI optimista y sincronización
Agregá la sección UI OPTIMISTA a AGENTS.md:
- Al mover un ticket de columna (usando el endpoint real del contrato; en la consigna de referencia es del estilo `PATCH /api/boards/:boardId/columns/:columnId/tickets/:ticketId`, pero validalo contra el backend): aplicar actualización optimista en el estado local (`onMutate` de TanStack Query).
- Si el backend responde con error (400 o 404): revertir el ticket a su columna original (`onError`, rollback al estado previo) y mostrar un Toast de error.
- El resto de las mutaciones (crear, editar, borrar) son peticiones estándar: esperan la respuesta del servidor antes de refrescar la UI.

# PASO 7: AGENTS.md — Estilo visual y Theme Switch
Agregá las secciones ESTILO y THEME SWITCH a AGENTS.md.

Estilo elegido: **Modern SaaS** (vibrante y accesible). Bordes redondeados de 8 a 12px, CTA con colores vibrantes, contraste WCAG AA.
- Light: fondo #FAFAFA, tarjetas #FFFFFF con sombra difuminada, texto #2D3748, acentos #00B8D9 (cian) y #6554C0 (púrpura).
- Dark: fondo #121212, tarjetas #1E1E1E con borde sutil #333333 (sin sombras), texto #E0E0E0, acentos #33E1ED (cian neón) y #9F8DF1 (púrpura claro).

Requerimientos del Theme Switch:
- PROHIBIDO hardcodear colores hexadecimales en los componentes. Los tokens viven en `src/styles/tokens.css`: `--bg-primary`, `--bg-card`, `--border-color`, `--text-primary`, `--accent-primary`, `--accent-secondary`, `--shadow-card`. Se definen en `:root` (light) y se redefinen bajo `.dark`.
- Detección de preferencia del sistema: el tema inicial se toma de `@media (prefers-color-scheme: dark)` / `prefers-color-scheme`, sin intervención manual.
- Persistencia: el componente `ThemeToggle` alterna la clase `.dark` en `<html>` y guarda la elección explícita del usuario en `localStorage`, para que sobreviva a los refrescos.
- Evitar el parpadeo de estilos (FOUC): script inline en `index.html` que aplica la clase `.dark` antes de que React monte.

# PASO 8: AGENTS.md — Mocks y workflow de desarrollo
Agregá la sección MOCKS a AGENTS.md:
- Crear `src/api/mockData.js` con datos sintéticos que respeten EXACTAMENTE las respuestas del backend real (o MSW si resulta simple), para poder desarrollar componentes sin depender de que el servidor local esté corriendo.
- La API base se consume exclusivamente desde `import.meta.env.VITE_API_URL`, para facilitar el despliegue posterior.
- Indicame paso a paso cómo levantar el backend local (comandos, variables de entorno, puerto, base de datos).

# PASO 9: AGENTS.md — Fases, reglas generales y cierre
Agregá las secciones FASES y REGLAS GENERALES a AGENTS.md:
- FASES: checklist con los pasos 10 a 14 de este documento (API, UI atómica, vistas y rutas, documentación, verificación y despliegue).
- REGLAS GENERALES: código limpio, sin componentes gigantes que mezclen UI con fetch; ante cualquier duda del contrato, leer el backend o preguntarme; al cerrar cada paso, resumir lo hecho y lo que sigue.

Luego releé AGENTS.md completo, verificá que no falte ninguna regla ni se contradiga con `docs/BACKEND_CONTRACT.md`, y mostrame el resultado final. Desde acá, AGENTS.md es de lectura obligatoria antes de cada tarea.

# PASO 10: Capa de servicio API (sin UI)
Escribí únicamente los métodos de integración con los endpoints del backend, en `src/api`:
- Servicios: auth, boards, columns, tickets (ej. `boardService.js`), con Axios.
- `baseURL` desde `VITE_API_URL`.
- Interceptor de autenticación según el mecanismo real del backend.
- Manejo de errores y propagación de excepciones (respetando el formato de error del contrato, para poder mapearlos a formularios después).
- Un método por endpoint existente. Ninguno inventado. Sin UI.

# PASO 11: Componentes atómicos de UI, tokens y Theme Switch
Construí la biblioteca de componentes tontos, sin conexión a API:
- Button, Input, Modal, Spinner, ThemeToggle, TicketCard, ColumnHeader.
- `TicketCard` recibe por props un `ticket` (con los campos reales del contrato, ej. title, description, priority) y un callback `onDelete`. Sin useEffect ni llamadas a API.
- Implementá `src/styles/tokens.css` y el theme switch completo (detección del sistema, ThemeToggle, localStorage, script anti-FOUC) según el PASO 7.
- Probá los componentes con `mockData.js`.

# PASO 12: Integración de vistas y rutas
Ensamblá las páginas conectando servicios y componentes con React Router DOM:
- LoginPage, BoardsListPage y BoardDetailPage (esta última con `useParams` para obtener el ID, consumo del servicio al montar, y estados loading / error / data).
- Ruta protegida y redirección a /login ante falta de sesión o 401.
- Formularios según el PASO 5 y UI optimista al mover tickets según el PASO 6.
- Probá todo contra el backend REAL.

# PASO 13: Documentación (front y back)
Generá documentos .md al estilo README, explicando decisiones de arquitectura, frameworks, librerías y demás componentes de la solución:
- `README.md` del frontend: decisiones de arquitectura, librerías, estructura de carpetas, temas, manejo de estado, integración con el backend, variables de entorno y cómo correr/desplegar.
- `README.md` del backend: decisiones de arquitectura, frameworks, librerías, estructura y cómo correr/desplegar. Pedime autorización antes de crear o modificar archivos en el backend.

# PASO 14: Verificación y despliegue
- `npm run build` sin errores.
- App funcionando contra el backend real (login, CRUD de boards/columns/tickets, mover tickets con UI optimista, theme switch).
- Guía para actualizar los repositorios y desplegar frontend y backend asegurando que funcionen, incluyendo CORS y la URL de producción (`VITE_API_URL`).
- Checklist final de verificación post-despliegue.

---

Empezá con el PASO 0.
