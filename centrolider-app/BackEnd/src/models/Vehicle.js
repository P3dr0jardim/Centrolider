const mongoose = require('mongoose');

const maintenanceRecordSchema = new mongoose.Schema({
  data: { type: Date, required: true },
  kms: { type: Number },
  descricao: { type: String, required: true },
  oficina: { type: String },
  custo: { type: Number, default: 0 },
  materiaisUsados: [{ type: mongoose.Schema.Types.Mixed }],
  custoAdicional: [{ descricao: { type: String }, valor: { type: Number } }],
}, { _id: true });

const vehicleSchema = new mongoose.Schema({
  frotaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fleet', required: true },
  matricula: { type: String, required: true, unique: true, uppercase: true, trim: true },
  modelo: { type: String, required: true },
  ano: { type: Number },
  condutor: { type: String },
  km:        { type: Number, default: 0 },
  kmInicial: { type: Number, default: 0 },
  status: { type: String, enum: ['Operacional', 'Manutenção', 'Inativo'], default: 'Operacional' },
  proximaRevisao: { type: Date },
  seguro: { type: Date },
  numeroQuadro: { type: String },
  cor: { type: String },
  combustivel: { type: String, enum: ['Gasolina', 'Diesel', 'Elétrico', 'Híbrido', 'GPL', 'Outro'] },
  cilindrada: { type: String },
  potencia: { type: String },
  dataEntrega: { type: Date },
  dataMatricula: { type: Date },
  numeroContrato: { type: String },
  rentabilidade: { type: Number },
  validadeContrato: { type: Date },
  kmsUltimaRevisao: { type: Number },
  intervaloRevisao: { type: Number },
  tipoPneu: { type: String },
  pneuOriginal: { type: String },
  pneuAtual: { type: String },
  scheduleAutoStatus: { type: Boolean, default: false },
  manutencaoDesde: { type: Date, default: null },
  historicoManutencao: [maintenanceRecordSchema],
  attachments: [{
    originalName:  { type: String },
    filename:      { type: String },
    mimetype:      { type: String },
    size:          { type: Number },
    path:          { type: String },
    fileData:      { type: Buffer, select: false }, // stored in DB, excluded from normal queries
    description:   { type: String },
    data:          { type: Date },
    archived:      { type: Boolean, default: false },
    manutencaoId:  { type: mongoose.Schema.Types.ObjectId, default: null },
  }],
  contactos: [{
    nome: { type: String },
    cargo: { type: String },
    telefone: { type: String },
    email: { type: String },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
