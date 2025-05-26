// server/models/Product.js
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String
});

const Product = mongoose.model('Product', ProductSchema);
export default Product;
