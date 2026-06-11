const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['Available', 'Low Stock', 'Out of Stock'], default: 'Available' }
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);