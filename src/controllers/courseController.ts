import { Request, Response } from "express";
import Course from "../models/Course";


//create crouse
export const createCourse = async (req:Request, res: Response) => {
  const course = await Course.create(req.body);
  res.status(201).json(course);
};

//get all courses
export const getCourses = async (req: Request, res: Response) => {
  const courses = await Course.find().populate("videos");
  res.json(courses);
};

//get course by id
export const GetCourse = async (req:Request, res:Response) =>{
  const {id} = req.params
  if(!id) return res.status(400).json({message:"Course is not available"})
  try{
    const course = await Course.findById(id)
    res.status(201).json(course)
  }catch(error){
    res.json({message:"Error finidng Course "})
  }
}
