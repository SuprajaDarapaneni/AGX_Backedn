import ReviewForm from "../models/ReviewForm.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const submitReview = async (req, res) => {
  try {
    const { name, email, rating, comment } = req.body;

    // Save review to DB
    const newReview = new ReviewForm({ name, email, rating, comment });
    await newReview.save();

    // Create transporter using environment variables for auth
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "itsmesupraja1@gmail.com",
        pass: process.env.EMAIL_PASS || "mpwr voty qgul auxl",
      },
      logger: true,   // Enable logger for debugging
      debug: true,    // Enable debug output
    });

    // Verify transporter configuration
    await transporter.verify();

    // Prepare mail options
    const mailOptions = {
      from: process.env.EMAIL_USER || "itsmesupraja1@gmail.com",  // Sender email
      to: "itsmesupraja1@gmail.com",                     // Recipient email
      subject: "New Customer Review",
      html: `
        <h3>Customer Review Submitted</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Rating:</strong> ${rating} Stars</p>
        <p><strong>Review:</strong> ${comment}</p>
      `,
    };

    // Send email and log info
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info);

    res.status(201).json({ message: "Review submitted successfully", newReview });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ message: "Error submitting review", error: error.message || error });
  }
};
