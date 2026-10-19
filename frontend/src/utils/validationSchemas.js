import { z } from 'zod';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

/**
 * Esquema para Login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El correo electrónico es requerido')
    .email('Debe ser un correo electrónico válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida'),
});

/**
 * Esquema para Crear Tablero (POST /api/boards)
 */
export const createBoardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre del tablero es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
});

/**
 * Esquema para Crear Columna (POST /api/boards/:boardId/columns)
 */
export const createColumnSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre de la columna es requerido'),
  order: z.coerce
    .number({ invalid_type_error: 'El orden debe ser un número' })
    .optional()
    .default(0),
});

/**
 * Esquema para Crear Ticket (POST .../tickets)
 */
export const createTicketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'El título del ticket es requerido'),
  description: z
    .string()
    .trim()
    .optional(),
  position: z.coerce
    .number({ invalid_type_error: 'La posición debe ser un número' })
    .optional()
    .default(0),
});

/**
 * Esquema para Actualizar Ticket (PATCH .../tickets/:ticketId)
 */
export const updateTicketSchema = z
  .object({
    title: z.string().trim().min(1, 'El título no puede estar vacío').optional(),
    description: z.string().trim().optional(),
    position: z.coerce.number().optional(),
    columnId: z
      .string()
      .regex(OBJECT_ID_REGEX, 'El ID de la columna destino es inválido')
      .optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.position !== undefined ||
      data.columnId !== undefined,
    {
      message: 'Debe proporcionar al menos un campo para actualizar',
    }
  );
