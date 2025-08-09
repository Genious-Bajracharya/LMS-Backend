import express from "express";
import { createCourse, GetCourse, getCourses } from "../controllers/courseController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();
router.post("/", protect, createCourse);
router.get("/", getCourses);
router.get("/:id",GetCourse)

export default router;
