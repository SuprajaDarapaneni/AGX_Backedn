
import BuySellForm from '../models/Buysellform.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const buysell = async (req, res) => {
  try {
    const {
      buySell,
      name,
      phone,
      email,
      industries,
      timing,
      imageUrls = [],
    } = req.body;

    if (!Array.isArray(industries) || industries.length === 0) {
      return res.status(400).json({ message: 'Please select at least one industry.' });
    }

    // Save to DB
    const newForm = new BuySellForm({
      buySell,
      name,
      phone,
      email,
      industries,
      timing,
      imageUrls,
    });

    await newForm.save();

    // Email notification
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const imageHtml = imageUrls
  .map(url => `<img src="${url}" alt="Uploaded Image" style="max-width:300px; margin-bottom:10px;" />`)
  .join('<br/>');




    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'yaswanthkumarch2001@gmail.com', // Replace with real recipient
      subject: 'New Buy/Sell Form Submission',
       html: `
    <h3>New Form Submission</h3>
    <p><strong>Type:</strong> ${buySell}</p>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Industries:</strong> ${industries.join(', ')}</p>
    <p><strong>Timing:</strong> ${timing}</p>
    ${imageUrls.length > 0 ? `<h4>Images:</h4>${imageHtml}` : ''}
  `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Form submitted and email sent successfully!' });

  } catch (error) {
    console.error('Error handling form submission:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
