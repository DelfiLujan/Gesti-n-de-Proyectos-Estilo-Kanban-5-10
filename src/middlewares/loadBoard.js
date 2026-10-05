const Board = require('../models/Board');
const AppError = require('../utils/AppError');

/**
 * Parent Check: Verifica que el tablero (boardId) exista en la base de datos.
 * Si no existe, responde 404 Not Found.
 * Si existe, adjunta el documento a req.board.
 */
const loadBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    if (!boardId) {
      return next();
    }

    const board = await Board.findById(boardId);
    if (!board) {
      return next(new AppError(404, 'Tablero no encontrado'));
    }

    req.board = board;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = loadBoard;
