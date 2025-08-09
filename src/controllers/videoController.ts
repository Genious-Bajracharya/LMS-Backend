import { Request, Response } from "express";
import Videos from "../models/Videos";

export const createVideo = async (req: Request, res: Response) => {
  const video = await Videos.create(req.body);
  res.status(201).json(video);
};

export const getVideos = async (req: Request, res: Response) => {
  const videos = await Videos.find();
  res.json(videos);
};
