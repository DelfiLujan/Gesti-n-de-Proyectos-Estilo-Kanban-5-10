const Column = require('../models/Column');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Agrega una columna a un tablero
 * @route   POST /api/boards/:boardId/columns
 * @access  Público
 */
const createColumn = asyncHandler(async (req, res) => {
  const { name, order } = req.body;
  const column = await Column.create({
    name: name.trim(),
    order: order !== undefined ? order : 0,
    board: req.params.boardId
  });

  res.status(201).json(column);
});

/**
 * @desc    Elimina una columna y sus tickets asociados en cascada
 * @route   DELETE /api/boards/:boardId/columns/:columnId
 * @access  Público
 */
const deleteColumn = asyncHandler(async (req, res) => {
  // Se usa la instancia del documento cargada por loadColumn para disparar el hook pre('deleteOne')
  await req.column.deleteOne();
  res.status(204).send();
});

module.exports = {
  createColumn,
  deleteColumn
};
