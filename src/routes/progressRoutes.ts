import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { updateProgress, getUserProgress } from "../controllers/progressController";

const router = express.Router();

router.post("/", protect, updateProgress); // update video progress
router.get("/:courseId", protect, getUserProgress); // get all progress for a course

export default router;


// import express from "express";
// import { protect } from "../middleware/authMiddleware";
// import {
//   updateProgress,
//   getCourseProgress,
//   getCourseProgressAdmin
// } from "../controllers/progressController";
// import { isAdmin } from "../middleware/adminMiddleware";

// const router = express.Router();

// router.post("/", protect, updateProgress);
// router.get("/course/:courseId", protect, getCourseProgress);

// // admin route (protected + isAdmin)
// router.get("/admin/course/:courseId", protect, isAdmin, getCourseProgressAdmin);

// export default router;
