const mongoose = require('mongoose');

const productRequestSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  productName: String,
  description: String,
  images: [String], // store image URLs or file paths
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProductRequest', productRequestSchema);
