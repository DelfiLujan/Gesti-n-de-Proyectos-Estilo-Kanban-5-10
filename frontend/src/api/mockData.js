/**
 * Datos sintéticos (Mocks) para desarrollo y pruebas de UI
 * Respeta rigurosamente el contrato de docs/BACKEND_CONTRACT.md:
 * - ObjectIds de 24 hex
 * - Campos reales: _id, name, columns, tickets, title, description, position, board, column, createdAt, updatedAt, __v
 * - SIN campos inventados (sin priority)
 */

export const mockTicket = {
  _id: '6701a2b3c4d5e6f7a8b9c0d5',
  title: 'Diseñar arquitectura frontend',
  description: 'Definir tokens, componentes atómicos y ruteo SPA con Vite.',
  position: 0,
  column: '6701a2b3c4d5e6f7a8b9c0d2',
  board: '6701a2b3c4d5e6f7a8b9c0d1',
  createdAt: '2026-10-19T10:00:00.000Z',
  updatedAt: '2026-10-19T10:00:00.000Z',
  __v: 0,
};

export const mockColumn = {
  _id: '6701a2b3c4d5e6f7a8b9c0d2',
  name: 'Por Hacer',
  order: 1,
  board: '6701a2b3c4d5e6f7a8b9c0d1',
  createdAt: '2026-10-19T10:00:00.000Z',
  updatedAt: '2026-10-19T10:00:00.000Z',
  tickets: [
    mockTicket,
    {
      _id: '6701a2b3c4d5e6f7a8b9c0d6',
      title: 'Configurar Zod schemas',
      description: 'Validaciones de cliente idénticas a las del backend en validateBody.js.',
      position: 1,
      column: '6701a2b3c4d5e6f7a8b9c0d2',
      board: '6701a2b3c4d5e6f7a8b9c0d1',
      createdAt: '2026-10-19T10:05:00.000Z',
      updatedAt: '2026-10-19T10:05:00.000Z',
      __v: 0,
    },
  ],
};

export const mockBoard = {
  _id: '6701a2b3c4d5e6f7a8b9c0d1',
  name: 'Sprint 1 — Lanzamiento DevBoard',
  createdAt: '2026-10-19T09:00:00.000Z',
  updatedAt: '2026-10-19T10:30:00.000Z',
  columns: [
    mockColumn,
    {
      _id: '6701a2b3c4d5e6f7a8b9c0d3',
      name: 'En Progreso',
      order: 2,
      board: '6701a2b3c4d5e6f7a8b9c0d1',
      createdAt: '2026-10-19T10:00:00.000Z',
      updatedAt: '2026-10-19T10:00:00.000Z',
      tickets: [
        {
          _id: '6701a2b3c4d5e6f7a8b9c0d7',
          title: 'Theme Switch con anti-FOUC',
          description: 'Persistencia en localStorage y CSS variables bajo :root y .dark.',
          position: 0,
          column: '6701a2b3c4d5e6f7a8b9c0d3',
          board: '6701a2b3c4d5e6f7a8b9c0d1',
          createdAt: '2026-10-19T10:10:00.000Z',
          updatedAt: '2026-10-19T10:10:00.000Z',
          __v: 0,
        },
      ],
    },
    {
      _id: '6701a2b3c4d5e6f7a8b9c0d4',
      name: 'Completado',
      order: 3,
      board: '6701a2b3c4d5e6f7a8b9c0d1',
      createdAt: '2026-10-19T10:00:00.000Z',
      updatedAt: '2026-10-19T10:00:00.000Z',
      tickets: [
        {
          _id: '6701a2b3c4d5e6f7a8b9c0d8',
          title: 'Análisis de Contrato del Backend',
          description: 'Documentado en BACKEND_CONTRACT.md sin invención de endpoints.',
          position: 0,
          column: '6701a2b3c4d5e6f7a8b9c0d4',
          board: '6701a2b3c4d5e6f7a8b9c0d1',
          createdAt: '2026-10-19T09:30:00.000Z',
          updatedAt: '2026-10-19T09:45:00.000Z',
          __v: 0,
        },
      ],
    },
  ],
};

export const mockBoardsList = [
  mockBoard,
  {
    _id: '6701a2b3c4d5e6f7a8b9c0e0',
    name: 'Roadmap Q4 — Mejoras de Infraestructura',
    createdAt: '2026-10-18T14:00:00.000Z',
    updatedAt: '2026-10-18T16:00:00.000Z',
    columns: [],
  },
];
