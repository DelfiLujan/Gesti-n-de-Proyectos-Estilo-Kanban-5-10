const AppError = require('../utils/AppError');

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

const schemas = {
  createBoard: (body) => {
    if (!body || typeof body !== 'object') {
      return 'El cuerpo de la petición es requerido';
    }
    const { name } = body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return 'El nombre del tablero es requerido';
    }
    if (name.trim().length > 100) {
      return 'El nombre no puede exceder 100 caracteres';
    }
    return null;
  },

  createColumn: (body) => {
    if (!body || typeof body !== 'object') {
      return 'El cuerpo de la petición es requerido';
    }
    const { name, order } = body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return 'El nombre de la columna es requerido';
    }
    if (order !== undefined && typeof order !== 'number') {
      return 'El orden debe ser un número';
    }
    return null;
  },

  createTicket: (body) => {
    if (!body || typeof body !== 'object') {
      return 'El cuerpo de la petición es requerido';
    }
    const { title, description, position } = body;
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return 'El título del ticket es requerido';
    }
    if (description !== undefined && typeof description !== 'string') {
      return 'La descripción debe ser un texto';
    }
    if (position !== undefined && typeof position !== 'number') {
      return 'La posición debe ser un número';
    }
    return null;
  },

  updateTicket: (body) => {
    if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
      return 'El cuerpo de la petición no puede estar vacío';
    }

    const allowedFields = ['title', 'description', 'position', 'columnId'];
    const keys = Object.keys(body);
    const hasAtLeastOne = keys.some((k) => allowedFields.includes(k));

    if (!hasAtLeastOne) {
      return 'Debe proporcionar al menos un campo válido: title, description, position, columnId';
    }

    const { title, description, position, columnId } = body;

    if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
      return 'El título no puede estar vacío';
    }
    if (description !== undefined && typeof description !== 'string') {
      return 'La descripción debe ser un texto';
    }
    if (position !== undefined && typeof position !== 'number') {
      return 'La posición debe ser un número';
    }
    if (columnId !== undefined && (typeof columnId !== 'string' || !OBJECT_ID_REGEX.test(columnId))) {
      return 'El ID de la columna destino es inválido';
    }

    return null;
  }
};

/**
 * Validador de cuerpo de petición (body) según esquema.
 * Si falla, invoca next con AppError(400, mensaje).
 * @param {'createBoard' | 'createColumn' | 'createTicket' | 'updateTicket'} schemaName 
 */
const validateBody = (schemaName) => {
  return (req, res, next) => {
    const validator = schemas[schemaName];
    if (!validator) {
      return next(new AppError(500, `Esquema de validación '${schemaName}' no encontrado`));
    }

    const errorMessage = validator(req.body);
    if (errorMessage) {
      return next(new AppError(400, errorMessage));
    }

    next();
  };
};

module.exports = validateBody;
