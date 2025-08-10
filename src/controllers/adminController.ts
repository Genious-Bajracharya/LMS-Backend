import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "../middlewares/errorMiddleware";
import User from "../models/User";
import Course from "../models/Course";
import Videos from "../models/Videos";
import bcrypt from "bcryptjs";

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    next(new ErrorResponse("Failed to fetch users", 500));
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(new ErrorResponse("User not found", 404));
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    next(new ErrorResponse("Failed to delete user", 500));
  }
};


export const updateCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return next(new ErrorResponse("Course not found", 404));
    res.json(course);
  } catch (error) {
    next(new ErrorResponse("Failed to update course", 500));
  }
};

export const deleteCourse = async (req: Request, res: Response,next: NextFunction) => {
  try{
    const { id } = req.params;
    await Videos.deleteMany({ _id: { $in: (await Course.findById(id))?.videos || [] } });
    await Course.findByIdAndDelete(id);
    res.json({ message: "Course and related videos deleted" });
  }catch(error){
    next(new ErrorResponse("Failed to Delete video", 500));
  }
};

export const updateVideo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const video = await Videos.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!video) return next(new ErrorResponse("Video not found", 404));
    res.json(video);
  } catch (error) {
    next(new ErrorResponse("Failed to update video", 500));
  }
};

export const deleteVideo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const video = await Videos.findByIdAndDelete(req.params.id);
    if (!video) return next(new ErrorResponse("Video not found", 404));
    res.json({ success: true, message: "Video deleted" });
  } catch (error) {
    next(new ErrorResponse("Failed to delete video", 500));
  }
};

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await User.create({
      name,
      email,
      password:hashedPassword,
      role: "admin",
    });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
