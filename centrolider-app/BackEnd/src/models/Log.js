const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName:    { type: String, default: 'Sistema' },
  // Fleet(s) this log entry relates to. Entries without this (legacy, or fleet-agnostic actions)
  // are only shown to unrestricted users — see utils/fleetScope.js#logFilter.
  frotaIds:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fleet' }],
  acao:        { type: String, required: true }, // 'Adicionou' | 'Editou' | 'Eliminou' | 'Registou'
  entidade:    { type: String, required: true }, // 'Viatura' | 'Despesa' | 'Receita' | 'Stock' | 'Serviço' | 'Frota' | 'Documento'
  descricao:   { type: String, required: true }, // human-readable PT
  referencia:  { type: String },                 // matricula / nome do item / etc.
  referenciaId:{ type: String },
  data:        { type: Date, default: Date.now },
}, { timestamps: false });

LogSchema.index({ data: -1 });

module.exports = mongoose.model('Log', LogSchema);
