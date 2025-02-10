const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
// Database Connection

const db = mysql.createConnection({
  host: "sql12.freesqldatabase.com", // Use hosted DB host
  user: "sql12762031", // Your DB username
  password: "Zt1Q7TqQ7r", // Your DB password
  database: "sql12762031", // Your DB name
  port: 3306, // MySQL default port
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    throw err;
  }
  console.log("Connected to MySQL database!");
});


// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MYMAIL,
    pass: process.env.PASSWORD
  }
});

function CompletePayment(user, amount) {
  console.log(`Processing payment of ₹${amount} for ${user.name}`);
  return { success: true, transaction_id: Date.now() };
}

function sendConfirmationEmail(name, email, batch, amount) {
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  const mailOptions = {
    from: process.env.MYMAIL,
    to: email,
    subject: 'Enrollment Confirmation - Yoga Class',
    text: `Hello ${name},\n\nYou have been successfully enrolled in batch ${batch} for the month of ${currentMonth}.\n\nYour payment of ₹${amount} has been successfully processed.\n\nBest regards,\nYoga Team`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Email Error:", error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

// API - Check Enrollment for Current Month
app.get("/check-enrollment/:email", (req, res) => {
  const { email } = req.params;
  const currentMonth = new Date().getMonth() + 1; // 1-12

  const sql = `SELECT 1 FROM users WHERE email = ? AND MONTH(created_at) = ? LIMIT 1;
`;
  db.query(sql, [email, currentMonth], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error." });
    }
    if (results.length > 0) {
      res.json({ enrolled: true, user: results[0] });
    } else {
      res.json({ enrolled: false });
    }
  });
});

// API - Enroll User (Reject if Already Paid for This Month)
app.post("/enroll", (req, res) => {
  const { name, age, email, phone, batch } = req.body;
  const currentMonth = new Date().getMonth() + 1;

  if (age < 18 || age > 65) {
    return res.status(400).json({ message: "Age must be between 18 and 65." });
  }

  // Check if already enrolled in current month
  db.query(`SELECT * FROM users WHERE email = ? AND MONTH(created_at) = ?`, [email, currentMonth], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error." });
    }
    if (results.length > 0) {
      return res.status(400).json({ message: "You have already enrolled for this month." });
    }

    // Process Payment
    const paymentResponse = CompletePayment({ name, email }, 500);
    if (!paymentResponse.success) {
      return res.status(500).json({ message: "Payment failed." });
    }

    // Insert into Database
    const sql = `INSERT INTO users (name, age, email, phone, batch_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())`;
    db.query(sql, [name, age, email, phone, batch], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database error." });
      }

      sendConfirmationEmail(name, email, batch, 500);
      res.json({ message: "Enrollment successful!" });
    });
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));