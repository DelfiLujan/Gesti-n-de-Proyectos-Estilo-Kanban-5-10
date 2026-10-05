const express = require('express');
const router = express.Router();
const boardController = require('../controllers/board.controller');
const validateObjectId = require('../middlewares/validateObjectId');
const loadBoard = require('../middlewares/loadBoard');
const validateBody = require('../middlewares/validateBody');
const columnRouter = require('./column.routes');

// Reenviar al router de columnas anidadas
router.use('/:boardId/columns', columnRouter);

// POST /api/boards
router.post(
  '/',
  validateBody('createBoard'),
  boardController.createBoard
);

// GET /api/boards/:boardId
router.get(
  '/:boardId',
  validateObjectId('boardId'),
  loadBoard,
  boardController.getBoardById
);

module.exports = router;
