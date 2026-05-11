const mongoose = require('mongoose');

const stockItemSchema = new mongoose.Schema({
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
