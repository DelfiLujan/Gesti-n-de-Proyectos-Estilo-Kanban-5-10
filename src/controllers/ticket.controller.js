const Ticket = require('../models/Ticket');
const Column = require('../models/Column');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Crea un ticket dentro de una columna
 * @route   POST /api/boards/:boardId/columns/:columnId/tickets
 * @access  Público
 */
const createTicket = asyncHandler(async (req, res) => {
  const { title, description, position } = req.body;
  const { boardId, columnId } = req.params;

  const ticket = await Ticket.create({
    title: title.trim(),
    description: description !== undefined ? description.trim() : undefined,
    position: position !== undefined ? position : 0,
    column: columnId,
    board: boardId
  });

  res.status(201).json(ticket);
});

/**
 * @desc    Mueve un ticket o actualiza su contenido (Idempotente y atómico)
 * @route   PATCH /api/boards/:boardId/columns/:columnId/tickets/:ticketId
 * @access  Público
 */
const updateTicket = asyncHandler(async (req, res, next) => {
  const { boardId, columnId, ticketId } = req.params;
  const { title, description, position, columnId: destColumnId } = req.body;

  // Si se solicita mover a otra columna, validar existencia y aislamiento del mismo tablero
  if (destColumnId) {
    const destColumn = await Column.findById(destColumnId);
    if (!destColumn || destColumn.board.toString() !== boardId.toString()) {
      return next(new AppError(404, 'Columna destino no encontrada en este tablero'));
    }
  }

  // Construir objeto de actualización con valores absolutos ($set)
  const updateFields = {};
  if (title !== undefined) updateFields.title = title.trim();
  if (description !== undefined) updateFields.description = description.trim();
  if (position !== undefined) updateFields.position = position;
  if (destColumnId !== undefined) updateFields.column = destColumnId;

  // Operación atómica evitando condiciones de carrera
  let ticket = await Ticket.findOneAndUpdate(
    { _id: ticketId, column: columnId, board: boardId },
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  // Manejo de idempotencia: si la petición se repite y el ticket ya fue movido a la columna destino
  if (!ticket && destColumnId) {
    const alreadyMoved = await Ticket.findOne({
      _id: ticketId,
      column: destColumnId,
      board: boardId
    });

    if (alreadyMoved) {
      return res.status(200).json(alreadyMoved);
    }
  }

  // Si no se encontró el ticket en la columna indicada
  if (!ticket) {
    return next(new AppError(404, 'Ticket no encontrado en esta columna'));
  }

  res.status(200).json(ticket);
});

module.exports = {
  createTicket,
  updateTicket
};
