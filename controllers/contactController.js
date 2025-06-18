import Contact from "../models/ContactUs.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Save to database
    const newContact = new Contact({ name, email, phone, message });
    await newContact.save();

    // Email transporter config from .env
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
      secure: process.env.EMAIL_SECURE === "true", // "false" becomes false
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_SEND,
      subject: "New Contact Form Submission",
      html: `
        <h3>Contact Form Details</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);

    res.status(201).json({ message: "Your message has been submitted successfully!" });
  } catch (error) {
    console.error("❌ Error submitting contact form:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
