const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const MAILCHIMP_API_KEY = "YOUR_MAILCHIMP_API_KEY"; // Keep this secret!
const LIST_ID = "YOUR_LIST_ID"; // Replace with your Mailchimp list ID
const DATA_CENTER = "YOUR_DC"; // Example: "us21" from "us21.api.mailchimp.com"

app.post("/subscribe", async (req, res) => {
  const { email_address } = req.body;

  if (!email_address) {
    return res.status(400).json({ message: "Email is required" });
  }

  const url = `https://${DATA_CENTER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members/`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString("base64")}`
    },
    body: JSON.stringify({ email_address, status: "subscribed" }),
  });

  const data = await response.json();
  
  if (response.ok) {
    res.status(200).json({ message: "Successfully subscribed!" });
  } else {
    res.status(400).json({ message: data.detail || "Subscription failed." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
