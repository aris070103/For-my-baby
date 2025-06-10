const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Optional CORS settings if you’re serving frontend separately (e.g., from 127.0.0.1:5500)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  next();
});

// Handle preflight requests
app.options('/send-email', (req, res) => {
  res.sendStatus(204);
});

// Email route
app.post('/send-email', (req, res) => {
  const { response } = req.body;

  if (!response) {
    return res.status(400).json({ success: false, message: 'Missing response data.' });
  }

  // Configure the transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS  // Gmail app password
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Send to yourself
    subject: 'Answer',
    text: `She said: ${response}`
  };

  // ✅ Updated block with full error logging
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ FULL ERROR:', error); // This logs the full error
      return res.status(500).json({
        success: false,
        message: 'Failed to send email.',
        error: error.message || error.toString()
      });
    }

    console.log('✅ Email sent:', info.response);
    res.status(200).json({ success: true, message: 'Email sent successfully!' });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
