import express from "express";
import { createVideo, getVideos } from "../controllers/videoController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();
router.post("/", protect, createVideo);
router.get("/", getVideos);

export default router;
