// routes/reviews.js
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
    res.status(200).json(reviews);
  } catch (err) {
    console.error('❌ Error fetching reviews:', err.message);
    res.status(500).json({ message: 'Failed to load reviews.' });
  }
});

// POST a new review (save + send email)
router.post('/', async (req, res) => {
  const { name, rating, comment } = req.body;
  console.log('📥 New review data received:', req.body);

  if (!name || !rating || !comment) {
    return res.status(400).json({ message: 'Name, rating, and comment are required.' });
  }

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
  }

  try {
    // Save review to MongoDB
    const review = new Review({ name, rating, comment });
    const savedReview = await review.save();
    console.log('✅ Review saved to DB:', savedReview);

    // Set up mail transporter
    const transporter = nodemailer.createTransport({
      host: 'smtpout.secureserver.net', // for GoDaddy
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();
    console.log('📡 Mail transporter verified');

    // Mail content
    const mailOptions = {
      from: `"Website Review Bot" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_SEND,
      subject: '📬 New Website Review Received',
      html: `
        <h3>New Review</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Rating:</strong> ${rating}/5</p>
        <p><strong>Comment:</strong><br>${comment}</p>
        <hr>
        <small>This is an automated message from the AGX website.</small>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', info.messageId);

    res.status(201).json({
      message: 'Review saved and email sent successfully!',
      review: savedReview,
    });

  } catch (err) {
    console.error('💥 Error:', err.message);
    res.status(500).json({
      message: 'An error occurred while processing the review.',
      error: err.message,
    });
  }
});

export default router;
