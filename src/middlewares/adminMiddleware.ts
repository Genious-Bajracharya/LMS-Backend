import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "./errorMiddleware";
import { IUser } from "../models/User";

interface AuthRequest extends Request {
  user?: IUser;
}

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  next(new ErrorResponse("Not authorized as admin", 403));
};
