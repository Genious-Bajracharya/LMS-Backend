import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware";
import { isAdmin } from "../middlewares/adminMiddleware";
import {
  getAllUsers,
  deleteUser,
  updateCourse,
  deleteCourse,
  updateVideo,
  deleteVideo,
  createAdmin
} from "../controllers/adminController";

const router = express.Router();

// USER MANAGEMENT
router.get("/users", protect, isAdmin, getAllUsers);
router.delete("/users/:id", protect, isAdmin, deleteUser);

// COURSE MANAGEMENT
router.put("/courses/:id", protect, isAdmin, updateCourse);
router.delete("/courses/:id", protect, isAdmin, deleteCourse);

// VIDEO MANAGEMENT
router.put("/videos/:id", protect, isAdmin, updateVideo);
router.delete("/videos/:id", protect, isAdmin, deleteVideo);

router.post("/createadmin",  createAdmin);

export default router;
