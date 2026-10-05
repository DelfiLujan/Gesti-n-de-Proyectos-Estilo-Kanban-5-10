const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del tablero es requerido'],
      trim: true,
      maxlength: [100, 'El nombre no puede exceder 100 caracteres']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual para poblar columnas del tablero
boardSchema.virtual('columns', {
  ref: 'Column',
  localField: '_id',
  foreignField: 'board'
});

// Hook de borrado en cascada (document-level)
// Al eliminar un tablero, se eliminan sus columnas y los tickets correspondientes
boardSchema.pre('deleteOne', { document: true, query: false }, async function () {
  const Column = mongoose.model('Column');
  const Ticket = mongoose.model('Ticket');

  // Eliminar todos los tickets del tablero
  await Ticket.deleteMany({ board: this._id });

  // Eliminar todas las columnas del tablero
  await Column.deleteMany({ board: this._id });
});

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;
