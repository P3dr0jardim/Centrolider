const mongoose = require('mongoose');

const stockItemSchema = new mongoose.Schema({
  // Fleet(s) this stock item belongs to. Items shared between fleets (e.g. Why Not Car Rental / 7M Rent a Car) list both.
  frotaIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fleet' }],
  categoria: {
    type: String,
    enum: ['pneus', 'filtros', 'oleo', 'travoes', 'baterias', 'lampadas', 'outros'],
    required: true,
  },
  nome: { type: String, required: true, trim: true },
  quantidade: { type: Number, required: true, min: 0, default: 0 },
  minimo: { type: Number, required: true, min: 0, default: 0 },
  fornecedor: { type: String, trim: true },
  preco: { type: Number, min: 0, default: 0 },
  historico: [{
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    matricula: { type: String },
    modelo: { type: String },
    quantidade: { type: Number },
    data: { type: Date },
    descricao: { type: String },
  }],
}, { timestamps: true });

module.exports = mongoose.model('StockItem', stockItemSchema);
