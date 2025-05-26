// routes/client.js
import express from "express";
import {
  getProducts, // Assuming this is for other client-related data, not products
  getCustomers,
  getTransactions,
  getGeography,
} from "../controllers/client.js"; // Make sure this path is correct

import {
  addProduct,
  getallProducts,
  getProductById, // Ensure getProductById is imported
  updateProduct,
  deleteProduct,
} from "../controllers/Productcard.js"; // Make sure this path is correct to your product controller

import multer from "multer";
import path from "path";
import fs from "fs"; // Import fs to ensure directory exists

const router = express.Router();

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Define the upload directory relative to your project root
    const uploadDir = path.join("public", "uploads"); 

    // Ensure the upload directory exists
    // It's highly recommended to do this once when your server starts (e.g., in server.js)
    // rather than on every request to prevent unnecessary file system calls.
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create a unique file name using timestamp and original extension
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
// --- End Multer Configuration ---


// Client Routes (assuming these are not related to product images)
router.get("/customers", getCustomers);
router.get("/transactions", getTransactions);
router.get("/geography", getGeography);

// Product Routes - NOW USING upload.fields()
// Route for adding a product (expects 'coverImage' and 'multipleImages')
router.post(
  "/addproduct",
  upload.fields([
    { name: "coverImage", maxCount: 1 },    // Expects a single file for 'coverImage'
    { name: "multipleImages", maxCount: 10 } // Expects up to 10 files for 'multipleImages'
  ]),
  addProduct
);

// Route for getting a single product by ID - CORRECTED TYPO HERE
router.get("/getproduct/:id", getProductById); // This was "getparorod" before

// Route for getting all products
router.get("/getproducts", getallProducts);

// Route for updating a product (can also include new images)
router.patch(
  "/updateproduct/:id",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "multipleImages", maxCount: 10 }
  ]),
  updateProduct
);

// Route for deleting a product
router.delete("/deleteproduct/:id", deleteProduct);

// Test route
router.get("/test", (req, res) => {
  res.send("Client route is working!");
});

export default router;