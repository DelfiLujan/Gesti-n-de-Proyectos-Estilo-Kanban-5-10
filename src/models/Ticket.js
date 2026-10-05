const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título del ticket es requerido'],
      trim: true,
      validate: {
        validator: function (v) {
          return typeof v === 'string' && v.trim().length > 0;
        },
        message: 'El título del ticket no puede estar vacío'
      }
    },
    description: {
      type: String,
      trim: true
    },
    column: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Column',
      required: [true, 'La columna es requerida'],
      index: true
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: [true, 'El tablero es requerido'],
      index: true
    },
    position: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    optimisticConcurrency: true
  }
);

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
