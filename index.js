import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from 'path'; // Needed for path manipulation
import { fileURLToPath } from 'url'; // For __dirname in ES Modules
import { dirname } from 'path'; // For __dirname in ES Modules
import fs from 'fs'; // Needed for file system operations like deleting all images

// Route imports
import clientRoutes from "./routes/client.js";
import generalRoutes from "./routes/general.js";
import managementRoutes from "./routes/management.js";
import contactRoutes from "./routes/contact.js";
import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import reviewFormRoutes from "./routes/reviewFormRoutes.js";

// Data model imports
import User from "./models/User.js";
import Product from "./models/Product.js";
import ProductStat from "./models/ProductStat.js";
import Transaction from "./models/Transaction.js";
import OverallStat from "./models/OverallStat.js";
import AffiliateStat from "./models/AffiliateStat.js";
import Productcard from "./models/Productcard.js";
import Contact from "./models/ContactUs.js";
// import ReviewForm from "./models/reviewForm.js"; // Optional: only if saving reviews to DB

// Sample data (for one-time seeding if needed)
import {
  dataUser,
  dataProduct,
  dataProductStat,
  dataTransaction,
  dataOverallStat,
  dataAffiliateStat,
} from "./data/index.js";

/* CONFIGURATION */
dotenv.config();
const app = express();

// ES Modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const allowedOrigins = [
  'http://localhost:5173',
  'https://www.agx-international.com',
  'https://agx-frontend.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// --- IMPORTANT: Correct static file serving for 'uploads' folder ---
// Assuming your 'uploads' folder is directly in the same directory as 'server.js'
const UPLOAD_DIR = path.join(__dirname, 'uploads');
app.use("/uploads", express.static(UPLOAD_DIR));

// Ensure the 'uploads' directory exists (optional, but good practice)
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/* ROUTES */
app.use("/client", clientRoutes);
app.use("/general", generalRoutes);
app.use("/management", managementRoutes);
app.use("/auth", authRoutes);
app.use("/", contactRoutes);
app.use("/blogs", blogRoutes);
app.use("/reviews", reviewRoutes);
app.use("/reviewform", reviewFormRoutes);

// --- NEW: Endpoint to delete all images from the uploads folder ---
app.delete('/api/images/all', (req, res) => {
    fs.readdir(UPLOAD_DIR, (err, files) => {
        if (err) {
            console.error('Error reading upload directory for deletion:', err);
            return res.status(500).json({ error: 'Unable to read upload directory.' });
        }

        if (files.length === 0) {
            return res.status(200).json({ message: 'No images to delete in the upload folder.' });
        }

        let deletedCount = 0;
        let errorCount = 0;

        files.forEach(file => {
            const filePath = path.join(UPLOAD_DIR, file);
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error(`Error deleting file ${file}:`, unlinkErr);
                    errorCount++;
                } else {
                    deletedCount++;
                }

                if (deletedCount + errorCount === files.length) {
                    if (errorCount === 0) {
                        res.status(200).json({ message: `Successfully deleted ${deletedCount} images.` });
                    } else {
                        res.status(200).json({
                            message: `Deleted ${deletedCount} images, with ${errorCount} errors.`,
                            errors: true
                        });
                    }
                }
            });
        });
    });
});

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 9000;
mongoose
  .connect(process.env.MONGO_URL || "mongodb://localhost:27017/ecomm", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));

    /* ONLY ADD DATA ONE TIME */
    // User.insertMany(dataUser);
    // Product.insertMany(dataProduct);
    // ProductStat.insertMany(dataProductStat);
    // Transaction.insertMany(dataTransaction);
    // OverallStat.insertMany(dataOverallStat);
    // AffiliateStat.insertMany(dataAffiliateStat);
  })
  .catch((error) => console.log(`${error} did not connect`));