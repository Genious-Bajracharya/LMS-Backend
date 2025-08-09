import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";



dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();



// Root Endpoint
app.get("/", (req, res) => {
  res.send("Mini-LMS Backend is running 🚀");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
