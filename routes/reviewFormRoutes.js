import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
// import ReviewForm from "../models/reviewForm.js"; // Uncomment if saving to DB

dotenv.config();
const router = express.Router();

router.post("/submit", async (req, res) => {
  const { name, rating, comment } = req.body;

  if (!name || !rating || !comment) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Optional: Save to MongoDB
    // const newReview = new ReviewForm({ name, rating, comment });
    // await newReview.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Review Form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_RECEIVER,
      subject: "New Review Submitted",
      html: `
        <h2>New Review Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Rating:</strong> ${rating}</p>
        <p><strong>Comment:</strong> ${comment}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Review submitted and emailed successfully." });
  } catch (error) {
    console.error("Review Form Error:", error.message);
    res.status(500).json({ message: "Something went wrong." });
  }
});

export default router;
