const mongoose = require('mongoose');

const fleetSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  description:    { type: String, trim: true },
  imageUrl:       { type: String },
  orcamentoPneus: { type: Number, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Fleet', fleetSchema);
