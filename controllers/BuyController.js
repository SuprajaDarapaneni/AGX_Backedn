// controllers/buySellController.js

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

    console.log("📨 New Buy/Sell submission:", { buySell, name, phone, email, industries, timing });

    // Validate inputs
    if (!buySell || !name || !phone || !email || !timing || !Array.isArray(industries) || industries.length === 0) {
      return res.status(400).json({ message: 'All fields including at least one industry are required.' });
    }

    // Save to MongoDB
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
    console.log("✅ Form saved to DB");

    // Email transporter using GoDaddy SMTP (STARTTLS)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtpout.secureserver.net',
      port: parseInt(process.env.EMAIL_PORT, 10) || 465,
      secure: false, // false for STARTTLS (port 587)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2',
      },
      logger: true,
      debug: process.env.DEBUG === 'true',
    });

    // Compose image HTML
    const imageHtml = imageUrls.length > 0
      ? `<h4>Attached Images:</h4>${imageUrls.map(url => `<img src="${url}" style="max-width:300px; margin:10px 0;" />`).join('<br/>')}`
      : '';

    // Email content
    const mailOptions = {
      from: `"AGX Marketplace" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_SEND, // e.g. info@agx-international.com
      subject: `📋 New ${buySell} Inquiry Submission`,
      html: `
        <h2>Buy/Sell Form Submission</h2>
        <p><strong>Type:</strong> ${buySell}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Industries:</strong> ${industries.join(', ')}</p>
        <p><strong>Timing:</strong> ${timing}</p>
        ${imageHtml}
        <hr/>
        <small>This message was generated automatically from your website.</small>
      `,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent:", info.messageId);

    res.status(201).json({ message: 'Form submitted and email sent successfully!' });

  } catch (error) {
    console.error('❌ Error in Buy/Sell submission:', error.stack || error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
