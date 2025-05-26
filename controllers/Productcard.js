import Productcard from "../models/Productcard.js"; // Make sure this path is correct
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url'; // For ES Modules __dirname equivalent

// Get __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to delete a single file
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

// GET all products
export const getallProducts = async (req, res) => {
  try {
    const products = await Productcard.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching all products:", error);
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
};

// GET single product by ID
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

// Add a new product
export const addProduct = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    // req.files will contain fields named 'coverImage' and 'multipleImages'
    const coverImageFile = req.files?.coverImage?.[0]; // Multer stores single file in an array
    const multipleImageFiles = req.files?.multipleImages || [];

    // Basic validation
    if (!name || !category || !description) {
      return res.status(400).json({ message: "Name, category, and description are required" });
    }
    if (!coverImageFile) {
      return res.status(400).json({ message: "Cover image is required" });
    }

    const coverImagePath = `/uploads/${coverImageFile.filename}`;
    const multipleImagePaths = multipleImageFiles.map(file => `/uploads/${file.filename}`);

    const newProduct = new Productcard({
      name,
      category,
      description,
      coverImage: coverImagePath,
      multipleImages: multipleImagePaths,
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error adding product:", error);
    // Clean up uploaded files if an error occurs during save
    if (req.files?.coverImage?.[0]) {
      deleteFile(req.files.coverImage[0].path);
    }
    if (req.files?.multipleImages) {
      req.files.multipleImages.forEach(file => deleteFile(file.path));
    }
    res.status(500).json({ message: "Failed to add product", error: error.message });
  }
};

// Update an existing product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description } = req.body;

    const product = await Productcard.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedData = {
      name: name || product.name, // Only update if provided
      category: category || product.category,
      description: description || product.description,
    };

    // Handle cover image update
    const newCoverImageFile = req.files?.coverImage?.[0];
    if (newCoverImageFile) {
      // Delete old cover image if it exists
      if (product.coverImage) {
        deleteFile(path.join(__dirname, '..', 'public', product.coverImage));
      }
      updatedData.coverImage = `/uploads/${newCoverImageFile.filename}`;
    }

    // Handle multiple images update
    const newMultipleImageFiles = req.files?.multipleImages || [];
    if (newMultipleImageFiles.length > 0) {
      // Delete old multiple images (if replacing)
      // NOTE: This assumes replacement. If you want to append, adjust logic here
      if (product.multipleImages && product.multipleImages.length > 0) {
        product.multipleImages.forEach(img => deleteFile(path.join(__dirname, '..', 'public', img)));
      }
      updatedData.multipleImages = newMultipleImageFiles.map(file => `/uploads/${file.filename}`);
    } else if (req.body.multipleImages === '' || req.body.multipleImages === '[]') {
        // If frontend explicitly sends an empty array string or empty string for multipleImages,
        // it means remove all existing multiple images.
        if (product.multipleImages && product.multipleImages.length > 0) {
            product.multipleImages.forEach(img => deleteFile(path.join(__dirname, '..', 'public', img)));
        }
        updatedData.multipleImages = [];
    }
    // If newMultipleImageFiles is empty AND req.body.multipleImages is not an empty string/array string,
    // then the user didn't select new multiple images and didn't explicitly ask to clear them,
    // so existing ones are retained by not overwriting `updatedData.multipleImages`.


    const updatedProduct = await Productcard.findByIdAndUpdate(id, updatedData, { new: true });
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(`Error updating product ${req.params.id}:`, error);
    // Clean up newly uploaded files if an error occurs during update
    if (req.files?.coverImage?.[0]) {
      deleteFile(req.files.coverImage[0].path);
    }
    if (req.files?.multipleImages) {
      req.files.multipleImages.forEach(file => deleteFile(file.path));
    }
    res.status(500).json({ message: "Failed to update product", error: error.message });
  }
};

// DELETE product
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