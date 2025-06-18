import ReviewForm from "../models/ReviewForm.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const submitReview = async (req, res) => {
  try {
    const { name, email, rating, comment } = req.body;

    // Save review to DB (private)
    const newReview = new ReviewForm({ name, email, rating, comment });
    await newReview.save();

    // Nodemailer transporter using GoDaddy Webmail
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,                 // smtpout.secureserver.net
      port: parseInt(process.env.EMAIL_PORT),       // 465
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,               // info@agx-international.com
        pass: process.env.EMAIL_PASS,
      },
      logger: true,
      debug: true,
    });

    await transporter.verify(); // optional: verify SMTP settings before sending

    // Email message config
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_SEND, // Send to your inbox
      subject: "New Customer Review Received",
      html: `
        <h3>Customer Review Details</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Rating:</strong> ${rating} Stars</p>
        <p><strong>Comment:</strong><br>${comment}</p>
      `,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Review email sent:", info.messageId);

    // Respond with confirmation (but don't send back review data)
    res.status(201).json({ message: "Review submitted successfully." });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ message: "Failed to submit review", error: error.message || error });
  }
};

