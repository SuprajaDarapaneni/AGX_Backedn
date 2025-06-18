import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import Review from '../models/Review.js';

dotenv.config();
const router = express.Router();

// GET all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ date: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error.message);
    res.status(500).json({ message: 'Failed to load reviews.' });
  }
});

// POST new review: save to DB + send email
router.post('/', async (req, res) => {
  const { name, rating, comment } = req.body;
  console.log('Received data:', req.body);

  if (!name || !rating || !comment) {
    return res.status(400).json({ message: 'Name, rating, and comment are required.' });
  }

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
  }

  try {
    // Save to DB
    const newReview = new Review({ name, rating, comment });
    const savedReview = await newReview.save();
    console.log('Saved review:', savedReview);

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();
    console.log("✅ Gmail SMTP verified");

    const mailOptions = {
      from: `"Review Notification" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_SEND,
      subject: "📩 New Review Received",
      html: `
        <h2>New Review Submitted</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Rating:</strong> ${rating} ⭐</p>
        <p><strong>Comment:</strong><br>${comment}</p>
        <hr>
        <small>This was sent automatically by your website's review system.</small>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent:", info.messageId);

    res.status(201).json({ message: "Review submitted and emailed successfully." });

  } catch (error) {
    console.error("❌ Error submitting review:", error.message);
    res.status(500).json({ message: 'Failed to submit review.', error: error.message });
  }
});

export default router;
