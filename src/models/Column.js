const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre de la columna es requerido'],
      trim: true
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: [true, 'El tablero es requerido'],
      index: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual para poblar tickets de la columna
columnSchema.virtual('tickets', {
  ref: 'Ticket',
  localField: '_id',
  foreignField: 'column'
});

// Hook de borrado en cascada (document-level)
// Al eliminar una columna, se eliminan todos sus tickets asociados
columnSchema.pre('deleteOne', { document: true, query: false }, async function () {
  const Ticket = mongoose.model('Ticket');
  await Ticket.deleteMany({ column: this._id });
});

const Column = mongoose.model('Column', columnSchema);

module.exports = Column;
