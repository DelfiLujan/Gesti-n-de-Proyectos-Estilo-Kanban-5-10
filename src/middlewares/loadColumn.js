const Column = require('../models/Column');
const AppError = require('../utils/AppError');

/**
 * Parent Check + Aislamiento:
 * 1. Verifica que la columna (columnId) exista en la base de datos (404 si no).
 * 2. Si la ruta incluye :boardId, comprueba que column.board coincida con boardId.
 *    Si la columna pertenece a otro tablero, rechaza con 404 Not Found (aislamiento de recursos).
 * 3. Si todo es correcto, adjunta el documento a req.column.
 */
const loadColumn = async (req, res, next) => {
  try {
    const { boardId, columnId } = req.params;
    if (!columnId) {
      return next();
    }

    const column = await Column.findById(columnId);
    if (!column) {
      return next(new AppError(404, 'Columna no encontrada'));
    }

    // Aislamiento: verificar que la columna pertenezca al boardId de la URL
    if (boardId && column.board.toString() !== boardId.toString()) {
      return next(new AppError(404, 'Columna no encontrada'));
    }

    req.column = column;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = loadColumn;
