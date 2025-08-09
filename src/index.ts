import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";

import authRoutes from "./routes/authRoutes";
import courseRoutes from "./routes/courseRoutes"
import videoRoutes from "./routes/videoRoutes";
import adminRoutes from "./routes/adminRoutes";
import progresRoutes from "./routes/progressRoutes"

import { errorHandler } from "./middlewares/errorMiddleware";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(errorHandler);

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/progress", progresRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
