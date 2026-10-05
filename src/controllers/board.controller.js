const Board = require('../models/Board');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Crea un nuevo tablero
 * @route   POST /api/boards
 * @access  Público
 */
const createBoard = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const board = await Board.create({ name: name.trim() });
  res.status(201).json(board);
});

/**
 * @desc    Obtiene un tablero con sus columnas (y tickets) pobladas
 * @route   GET /api/boards/:boardId
 * @access  Público
 */
const getBoardById = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.boardId).populate({
    path: 'columns',
    options: { sort: { order: 1 } },
    populate: {
      path: 'tickets',
      options: { sort: { position: 1 } }
    }
  });

  res.status(200).json(board);
});

module.exports = {
  createBoard,
  getBoardById
};
