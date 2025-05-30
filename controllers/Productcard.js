import Productcard from "../models/Productcard.js"; // Ensure this path is correct
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url'; // For ES Modules __dirname equivalent

// Get __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to delete a single file safely
const deleteFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    } catch (err) {
      console.error(`Error deleting file ${filePath}:`, err);
    }
  }
};

// --- GET all products ---
export const getallProducts = async (req, res) => {
  try {
    const products = await Productcard.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching all products:", error);
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
};

// --- GET single product by ID ---
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Productcard.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(`Error fetching product by ID ${req.params.id}:`, error);
    res.status(500).json({ message: "Failed to fetch product", error: error.message });
  }
};

// --- Add a new product ---
export const addProduct = async (req, res) => {
  try {
    // Extract all expected fields from req.body
    const { 
      name, 
      category, 
      description, 
      bannerTitle, 
      introduction, 
      productRange, 
      additionalInfo, 
      whyChooseUs 
    } = req.body;
    
    const coverImageFile = req.files?.coverImage?.[0]; // Multer stores single file in an array
    const multipleImageFiles = req.files?.multipleImages || [];

    // Basic validation: Ensure core fields and cover image are present
    if (!name || !category) { 
      return res.status(400).json({ message: "Name and category are required." });
    }
    if (!coverImageFile) {
      return res.status(400).json({ message: "Cover image is required." });
    }

    const coverImagePath = `/uploads/${coverImageFile.filename}`;
    const multipleImagePaths = multipleImageFiles.map(file => `/uploads/${file.filename}`);

    const newProduct = new Productcard({
      name,
      category,
      description,
      bannerTitle, 
      introduction,
      productRange,
      additionalInfo,
      whyChooseUs,
      coverImage: coverImagePath,
      multipleImages: multipleImagePaths,
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error adding product:", error);
    // Clean up any newly uploaded files if an error occurs during database save
    if (req.files?.coverImage?.[0]) {
      deleteFile(req.files.coverImage[0].path);
    }
    if (req.files?.multipleImages) {
      req.files.multipleImages.forEach(file => deleteFile(file.path));
    }
    res.status(500).json({ message: "Failed to add product", error: error.message });
  }
};

// --- Update an existing product ---
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    // Extract ALL expected fields from req.body
    const { 
      name, 
      category, 
      description, 
      bannerTitle, 
      introduction, 
      productRange, 
      additionalInfo, 
      whyChooseUs 
    } = req.body;

    const product = await Productcard.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedData = {};

    // Conditionally add fields to updatedData only if they are explicitly provided in the request body.
    // This allows for partial updates and updating fields to empty strings.
    if (name !== undefined) updatedData.name = name;
    if (category !== undefined) updatedData.category = category;
    if (description !== undefined) updatedData.description = description;
    if (bannerTitle !== undefined) updatedData.bannerTitle = bannerTitle; 
    if (introduction !== undefined) updatedData.introduction = introduction;
    if (productRange !== undefined) updatedData.productRange = productRange;
    if (additionalInfo !== undefined) updatedData.additionalInfo = additionalInfo;
    if (whyChooseUs !== undefined) updatedData.whyChooseUs = whyChooseUs;

    // Handle cover image update
    const newCoverImageFile = req.files?.coverImage?.[0];
    if (newCoverImageFile) {
      // Delete old cover image from file system if a new one is provided
      if (product.coverImage) {
        deleteFile(path.join(__dirname, '..', 'public', product.coverImage));
      }
      updatedData.coverImage = `/uploads/${newCoverImageFile.filename}`;
    }

    // Handle multiple images update
    const newMultipleImageFiles = req.files?.multipleImages || [];
    if (newMultipleImageFiles.length > 0) {
      // If new multiple images are provided, delete the old ones and set the new ones
      if (product.multipleImages && product.multipleImages.length > 0) {
        product.multipleImages.forEach(img => deleteFile(path.join(__dirname, '..', 'public', img)));
      }
      updatedData.multipleImages = newMultipleImageFiles.map(file => `/uploads/${file.filename}`);
    } else if (req.body.multipleImages === '' || req.body.multipleImages === '[]') {
        // If the frontend explicitly sends an empty string or '[]' for multipleImages,
        // it indicates a request to remove all existing multiple images.
        if (product.multipleImages && product.multipleImages.length > 0) {
            product.multipleImages.forEach(img => deleteFile(path.join(__dirname, '..', 'public', img)));
        }
        updatedData.multipleImages = [];
    }
    // If no new files are uploaded for multipleImages and no explicit clear signal is sent,
    // then `updatedData.multipleImages` is not set, meaning existing ones are retained.

    const updatedProduct = await Productcard.findByIdAndUpdate(id, updatedData, { new: true });
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(`Error updating product ${req.params.id}:`, error);
    // Clean up any newly uploaded files if an error occurs during database update
    if (req.files?.coverImage?.[0]) {
      deleteFile(req.files.coverImage[0].path);
    }
    if (req.files?.multipleImages) {
      req.files.multipleImages.forEach(file => deleteFile(file.path));
    }
    res.status(500).json({ message: "Failed to update product", error: error.message });
  }
};

// --- DELETE product ---
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Productcard.findById(id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    // Delete cover image from file system
    if (product.coverImage) {
      deleteFile(path.join(__dirname, '..', 'public', product.coverImage));
    }

    // Delete multiple images from file system
    if (product.multipleImages && product.multipleImages.length > 0) {
      product.multipleImages.forEach(img => deleteFile(path.join(__dirname, '..', 'public', img)));
    }

    await Productcard.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(`Error deleting product ${req.params.id}:`, error);
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
};