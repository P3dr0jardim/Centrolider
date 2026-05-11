const mongoose = require('mongoose');

const fleetSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  imageUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Fleet', fleetSchema);
