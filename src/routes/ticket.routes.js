const express = require('express');
const router = express.Router({ mergeParams: true });
const ticketController = require('../controllers/ticket.controller');
const validateObjectId = require('../middlewares/validateObjectId');
const loadBoard = require('../middlewares/loadBoard');
const loadColumn = require('../middlewares/loadColumn');
const validateBody = require('../middlewares/validateBody');

// POST /api/boards/:boardId/columns/:columnId/tickets
router.post(
  '/',
  validateObjectId('boardId', 'columnId'),
  loadBoard,
  loadColumn,
  validateBody('createTicket'),
  ticketController.createTicket
);

// PATCH /api/boards/:boardId/columns/:columnId/tickets/:ticketId
router.patch(
  '/:ticketId',
  validateObjectId('boardId', 'columnId', 'ticketId'),
  loadBoard,
  loadColumn,
  validateBody('updateTicket'),
  ticketController.updateTicket
);

module.exports = router;
