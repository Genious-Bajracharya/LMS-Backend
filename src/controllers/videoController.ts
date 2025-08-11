import { Request, Response } from "express";
import Videos from "../models/Videos";
import Course from "../models/Course";

// Create 
export const createVideo = async (req: Request, res: Response) => {
  const { title, url, courseId,duration } = req.body;
  try {
    const video = await Videos.create({ title, url,duration });
    await Course.findByIdAndUpdate(courseId, { $push: { videos: video._id } });
    res.status(201).json(video);
  } catch (err) {
    res.status(500).json({ message: "Error creating video" });
  }
};

// Delete
export const deleteVideo = async (req: Request, res: Response) => {
  const { id, courseId } = req.params;
  await Videos.findByIdAndDelete(id);
  await Course.findByIdAndUpdate(courseId, { $pull: { videos: id } });
  res.json({ message: "Video deleted" });
};

export const getVideos = async (req: Request, res: Response) => {
  const videos = await Videos.find();
  res.json(videos);
};
