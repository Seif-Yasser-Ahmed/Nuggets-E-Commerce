// // resetRoutes.js
// import express from 'express';
// import nodemailer from 'nodemailer';
// const router = express.Router();

// router.post('/send-reset', async (req, res) => {
//     const { email } = req.body;
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS
//         }
//     });

//     const resetLink = `http://localhost:3000/reset-confirm?email=${encodeURIComponent(email)}`;
//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: email,
//         subject: 'Reset Your Password',
//         html: `
//       <h2>Password Reset Request</h2>
//       <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
//     `
//     };

//     console.log('Sending email with options:', mailOptions);
//     try {
//         await transporter.sendMail(mailOptions);
//         return res.status(200).json({ message: 'Email sent' });
//     } catch (err) {
//         console.error('Email send error:', err);
//         return res.status(500).json({ error: 'Email failed to send' });
//     }
// });

// export default router;
