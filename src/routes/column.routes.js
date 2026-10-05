const express = require('express');
const router = express.Router({ mergeParams: true });
const columnController = require('../controllers/column.controller');
const validateObjectId = require('../middlewares/validateObjectId');
const loadBoard = require('../middlewares/loadBoard');
const loadColumn = require('../middlewares/loadColumn');
const validateBody = require('../middlewares/validateBody');
const ticketRouter = require('./ticket.routes');

// Reenviar al router de tickets anidados
router.use('/:columnId/tickets', ticketRouter);

// POST /api/boards/:boardId/columns
router.post(
  '/',
  validateObjectId('boardId'),
  loadBoard,
  validateBody('createColumn'),
  columnController.createColumn
);

// DELETE /api/boards/:boardId/columns/:columnId
router.delete(
  '/:columnId',
  validateObjectId('boardId', 'columnId'),
  loadBoard,
  loadColumn,
  columnController.deleteColumn
);

module.exports = router;
