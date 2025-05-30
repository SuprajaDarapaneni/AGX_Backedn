import mongoose from "mongoose";

const ProductCardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: "" // Allow empty description if not strictly required
    },
    bannerTitle: {
      type: String,
      default: ""
    },
    introduction: {
      type: String,
      default: ""
    },
    productRange: {
      type: String,
      default: ""
    },
    additionalInfo: {
      type: String,
      default: ""
    },
    whyChooseUs: {
      type: String,
      default: ""
    },
    coverImage: {
      type: String,
      required: true // Ensure a cover image is always provided
    },
    multipleImages: {
      type: [String], // Array of strings for multiple image paths
      default: [] // Default to an empty array
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

const Productcard = mongoose.model("Productcard", ProductCardSchema);
export default Productcard;