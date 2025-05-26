// routes/formRoutes.js
import express from 'express';
import BuySellForm from '../models/Buysellform.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const buysell = async (req, res) => {
  try {
    const { buySell, name, phone, email, industries, timing } = req.body;

    // Validate industries
    if (!Array.isArray(industries) || industries.length === 0) {
      return res.status(400).json({ message: 'Please select at least one industry.' });
    }

    // Save form data to MongoDB
    const newForm = new BuySellForm({ buySell, name, phone, email, industries, timing });
    await newForm.save();

    // Email setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        pass: process.env.EMAIL_PASS, // your app-specific password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'receiver@example.com', // <-- Replace this with your receiving email
      subject: 'New Buy/Sell Form Submission',
      html: `
        <h3>New Form Submission</h3>
        <p><strong>Type:</strong> ${buySell}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Industries:</strong> ${industries.join(', ')}</p>
        <p><strong>Timing:</strong> ${timing}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Form submitted and email sent successfully!' });

  } catch (error) {
    console.error('Error handling form submission:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
