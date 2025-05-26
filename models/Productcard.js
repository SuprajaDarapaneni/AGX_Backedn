import mongoose from "mongoose";

const ProductCardSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    category: String,
    // --- CORRECTED FIELDS BELOW ---
    coverImage: {
      type: String,
      required: true // Make it required if it always needs a cover image
    },
    multipleImages: {
      type: [String], // Array of strings for multiple image paths
      default: [] // Default to an empty array if no multiple images are provided
    },
    // --- END CORRECTED FIELDS ---
  },
  { timestamps: true }
);

const Productcard = mongoose.model("Productcard", ProductCardSchema);
export default Productcard;