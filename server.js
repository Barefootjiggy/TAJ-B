import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:3000", 
  methods: ["GET", "POST"],
  credentials: true,
}));
app.use(bodyParser.json());

app.post("/subscribe", async (req, res) => {
  const { email_address } = req.body;

  if (!email_address) {
    return res.status(400).json({ message: "Email is required" });
  }

  const url = `https://${process.env.MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members/`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`anystring:${process.env.MAILCHIMP_API_KEY}`).toString("base64")}`,
      },
      body: JSON.stringify({ email_address, status: "subscribed" }),
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ message: "Successfully subscribed!" });
    } else {
      console.log("Mailchimp error response:", data);

      // Return 409 Conflict for already-subscribed users
      if (data.title === "Member Exists" || data.detail?.includes("already a list member")) {
        return res.status(409).json({ message: "You're already subscribed!" });
      }

      return res.status(400).json({ message: data.detail || "Subscription failed." });
    }
  } catch (error) {
    console.error("❌ Error subscribing user:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
});

import nodemailer from "nodemailer"; 

app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER, 
      to: process.env.EMAIL_TO,
      subject: `New message from ${name}`,
      text: message,
      replyTo: email, 
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("❌ Email sending error:", error);
    return res.status(500).json({ message: "Failed to send message." });
  }
});

app.get("/", (req, res) => {
  res.send("🎉 Backend is running!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
