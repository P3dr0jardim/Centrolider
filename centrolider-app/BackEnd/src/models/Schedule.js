const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  viaturaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  tipoEvento: {
    type: String,
    enum: ['inspecao', 'revisao', 'seguro', 'reparacao', 'manutencao', 'contrato', 'outro'],
    required: true,
  },
  dataInicio: { type: Date, required: true },
  horaInicio: { type: String },
  dataFim: { type: Date },
  horaFim: { type: String },
  notas:   { type: String, trim: true },
  oficina: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
