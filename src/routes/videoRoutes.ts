import express from "express";
import { createVideo, deleteVideo, getVideos } from "../controllers/videoController";
import { protect } from "../middlewares/authMiddleware";
import { isAdmin } from "../middlewares/adminMiddleware";

const router = express.Router();
router.post("/", protect, createVideo);
router.get("/", getVideos);
router.delete("/:id",isAdmin,deleteVideo)

export default router;
