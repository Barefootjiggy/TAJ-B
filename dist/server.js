var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json());
// Load Mailchimp secrets from .env
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY || "";
const LIST_ID = process.env.MAILCHIMP_LIST_ID || "";
const DATA_CENTER = process.env.MAILCHIMP_DC || ""; // Example: "us21"
if (!MAILCHIMP_API_KEY || !LIST_ID || !DATA_CENTER) {
    console.error("❌ Missing Mailchimp credentials in .env file.");
    process.exit(1);
}
app.post("/subscribe", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email_address } = req.body;
    if (!email_address) {
        return res.status(400).json({ message: "Email is required" });
    }
    const url = `https://${DATA_CENTER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members/`;
    try {
        const response = yield fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString("base64")}`
            },
            body: JSON.stringify({ email_address, status: "subscribed" }),
        });
        const data = yield response.json();
        if (response.ok) {
            return res.status(200).json({ message: "Successfully subscribed!" });
        }
        else {
            return res.status(400).json({ message: data.detail || "Subscription failed." });
        }
    }
    catch (error) {
        console.error("❌ Error subscribing user:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
}));
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
