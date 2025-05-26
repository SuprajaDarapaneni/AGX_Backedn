// models/BuySellForm.js
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
    type: [String], // <-- ARRAY of strings to support multiple industries
    required: true,
  },
  timing: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export default mongoose.models.BuySellForm || mongoose.model('BuySellForm', BuySellFormSchema);
