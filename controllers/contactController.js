import Contact from "../models/ContactUs.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Log the incoming request for debugging
    console.log("📨 New contact form submission:", { name, email, phone, message });

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Save to MongoDB
    const newContact = new Contact({ name, email, phone, message });
    await newContact.save();
    console.log("✅ Contact saved to DB");

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT, 10) || 587,
      secure: process.env.EMAIL_SECURE === "true", // true for port 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("📩 Email transporter created");

    // Email options
    const mailOptions = {
      from: `"Website Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_SEND || process.env.EMAIL_USER,
      subject: "📬 New Contact Form Submission",
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);

    // Respond to client
    res.status(201).json({ message: "Your message has been submitted successfully!" });
  } catch (error) {
    console.error("❌ Error in contact form submission:", error.stack || error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
