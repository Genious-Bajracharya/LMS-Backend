import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || "", { expiresIn: "30d" });
};

export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });

    res.status(201).json({ _id: user.id, name: user.name, email: user.email, token: generateToken(user.id) });
    };

    export const loginUser = async (req: Request, res: Response) => {
        
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ _id: user.id, name: user.name, email: user.email, token: generateToken(user.id) });
};
