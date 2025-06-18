// controllers/contactController.js

import Contact from "../models/ContactUs.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    console.log("📨 Contact form submitted:", { name, email, phone, message });

    // Basic validation
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Save to MongoDB
    const newContact = new Contact({ name, email, phone, message });
    await newContact.save();
    console.log("✅ Contact saved to MongoDB");

    // Create mail transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtpout.secureserver.net", // Default to GoDaddy
      port: parseInt(process.env.EMAIL_PORT, 10) || 465,
      secure: process.env.EMAIL_SECURE === "true", // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();
    console.log("📡 SMTP verified");

    // Email content
    const mailOptions = {
      from: `"AGX Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_SEND, // Destination email (e.g. admin)
      subject: "📥 New Contact Message from Website",
      html: `
        <h3>New Contact Request</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong><br>${message}</p>
        <hr />
        <small>This email was sent via your website's contact form.</small>
      `,
    };

    const emailInfo = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent:", emailInfo.messageId);

    res.status(201).json({ message: "Your message was submitted and emailed successfully!" });
  } catch (err) {
    console.error("❌ Contact form error:", err.stack || err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
