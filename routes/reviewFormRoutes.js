// import express from "express";
// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// // import ReviewForm from "../models/reviewForm.js"; // Uncomment if saving to DB

// dotenv.config();
// const router = express.Router();

// router.post("/submit", async (req, res) => {
//   const { name, rating, comment } = req.body;

//   // Basic validation
//   if (!name || !rating || !comment) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   try {
//     // Optional: Save to MongoDB
//     // const newReview = new ReviewForm({ name, rating, comment });
//     // await newReview.save();

//     // Nodemailer transport using Gmail SMTP
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     // Verify transporter connection
//     await transporter.verify();
//     console.log("✅ SMTP transporter verified.");

//     // Email content
//     const mailOptions = {
//       from: `"Review Notification" <${process.env.EMAIL_USER}>`,
//       to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
//       subject: "📝 New Review Submitted",
//       html: `
//         <h2>New Review Submitted</h2>
//         <p><strong>Name:</strong> ${name}</p>
//         <p><strong>Rating:</strong> ${rating} ⭐</p>
//         <p><strong>Comment:</strong> ${comment}</p>
//         <hr>
//         <small>This message was generated by your website's review form.</small>
//       `,
//     };

//     // Send the email
//     const info = await transporter.sendMail(mailOptions);
//     console.log("📧 Email sent successfully:", info.messageId);

//     // Return success response
//     res.status(200).json({ message: "Review submitted and emailed successfully." });

//   } catch (error) {
//     console.error("❌ Review Form Error:", error.message);
//     res.status(500).json({ message: "Something went wrong while sending the email." });
//   }
// });

// export default router;
