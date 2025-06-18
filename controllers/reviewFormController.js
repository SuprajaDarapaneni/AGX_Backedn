// controllers/reviewController.js

import ReviewForm from "../models/ReviewForm.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const submitReview = async (req, res) => {
  try {
    const { name, email, rating, comment } = req.body;

    console.log("📨 Review form received:", { name, email, rating, comment });

    // Validate inputs
    if (!name || !email || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    // Save review to MongoDB
    const newReview = new ReviewForm({ name, email, rating, comment });
    const savedReview = await newReview.save();
    console.log("✅ Review saved:", savedReview);

    // Configure transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtpout.secureserver.net",
      port: parseInt(process.env.EMAIL_PORT, 10) || 465,
      secure: process.env.EMAIL_SECURE === "true", // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      logger: true,
      debug: process.env.DEBUG === "true",
    });

    await transporter.verify();
    console.log("📡 SMTP transporter verified");

    // Email content
    const mailOptions = {
      from: `"AGX Review Bot" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_SEND, // Destination email
      subject: "🌟 New Customer Review Submitted",
      html: `
        <h3>New Review Received</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Rating:</strong> ${rating} ⭐</p>
        <p><strong>Comment:</strong><br>${comment}</p>
        <hr />
        <small>Sent automatically from your website review system.</small>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent:", info.messageId);

    // Respond to client
    res.status(201).json({
      message: "Review submitted and email sent successfully.",
    });

  } catch (error) {
    console.error("❌ Error submitting review:", error.stack || error);
    res.status(500).json({
      message: "Failed to submit review or send email.",
      error: error.message || error,
    });
  }
};
