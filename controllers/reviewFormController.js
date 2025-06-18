import ReviewForm from "../models/ReviewForm.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const submitReview = async (req, res) => {
  try {
    const { name, email, rating, comment } = req.body;

    console.log("Received data:", { name, email, rating, comment });

    // Save review to the database
    const newReview = new ReviewForm({ name, email, rating, comment });
    const savedReview = await newReview.save();
    console.log("Saved review:", savedReview);

    // Create Nodemailer transporter with Gmail
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
      logger: true,
      debug: true,
    });

    // Verify transporter connection
    await transporter.verify();
    console.log("SMTP connection verified successfully");

    // Compose email content
    const mailOptions = {
      from: `"Review Notification" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_SEND, // Can send to another email
      subject: "📢 New Customer Review Submitted",
      html: `
        <h2>You've received a new customer review!</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Rating:</strong> ${rating} ⭐</p>
        <p><strong>Comment:</strong><br>${comment}</p>
        <hr>
        <small>This message was sent automatically by your website review system.</small>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Review email sent:", info.messageId);

    // Success response
    res.status(201).json({ message: "Review submitted and email sent successfully." });

  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({
      message: "Failed to submit review or send email.",
      error: error.message || error,
    });
  }
};
