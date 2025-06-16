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

    // Validate industries
    if (!Array.isArray(industries) || industries.length === 0) {
      return res.status(400).json({ message: 'Please select at least one industry.' });
    }

    // Save form data to MongoDB
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

    // Nodemailer transporter config using GoDaddy SMTP with STARTTLS on port 587
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,                  // smtpout.secureserver.net
      port: parseInt(process.env.EMAIL_PORT, 10),    // 587
      secure: false,                                  // use STARTTLS, NOT SSL on port 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,                    // accept self-signed certs
        minVersion: 'TLSv1.2',                         // enforce TLS 1.2 or higher
      },
      logger: true,
      debug: true,
    });

    // Build HTML for any uploaded images
    const imageHtml = imageUrls
      .map(url => `<img src="${url}" alt="Uploaded Image" style="max-width:300px; margin-bottom:10px;" />`)
      .join('<br/>');

    // Email message options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'info@agx-international.com', // recipient
      subject: 'New Buy/Sell Form Submission',
      html: `
        <h3>New Buy/Sell Request</h3>
        <p><strong>Type:</strong> ${buySell}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Industries:</strong> ${industries.join(', ')}</p>
        <p><strong>Timing:</strong> ${timing}</p>
        ${imageUrls.length > 0 ? `<h4>Images:</h4>${imageHtml}` : ''}
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Return success response
    res.status(201).json({ message: 'Form submitted and email sent successfully!' });

  } catch (error) {
    console.error('Error handling form submission:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
