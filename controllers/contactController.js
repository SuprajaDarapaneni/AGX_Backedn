import Contact from "../models/ContactUs.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate all fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Save to database
    const newContact = new Contact({ name, email, phone, message });
    await newContact.save();

    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,       // e.g., yourgmail@gmail.com
        pass: process.env.EMAIL_PASS,       // Gmail App Password (not normal password)
      },
    });

    // Email configuration
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "yaswanthkumarch2001@gmail.com",
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
    await transporter.sendMail(mailOptions);

    // Respond to frontend
    res.status(201).json({ message: "Your message has been submitted successfully!" });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
