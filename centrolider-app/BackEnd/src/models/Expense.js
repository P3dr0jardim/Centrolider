const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  tipo: {
    type: String,
    enum: ['combustivel', 'manutencao', 'reparacao', 'seguro', 'portagem', 'inspecao', 'multa', 'outro'],
    required: true,
  },
  valor: { type: Number, required: true, min: 0 },
  data: { type: Date, required: true },
  descricao: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
