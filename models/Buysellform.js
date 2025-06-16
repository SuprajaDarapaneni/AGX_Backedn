import mongoose from 'mongoose';

const BuySellFormSchema = new mongoose.Schema({
  buySell: {
    type: String,
    enum: ['buy', 'sell'],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  industries: {
    type: [String],
    required: true,
  },
  timing: {
    type: String,
    required: true,
  },
  imageUrls: {
    type: [String], // <-- NEW: store array of Cloudinary image URLs
    default: [],
  },
}, { timestamps: true });

export default mongoose.models.BuySellForm || mongoose.model('BuySellForm', BuySellFormSchema);
