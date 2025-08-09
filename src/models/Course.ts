import mongoose, { Document, Schema } from "mongoose";

export interface ICourse extends Document {
  title: string;
  description: string;
  videos: mongoose.Types.ObjectId[];
}

const courseSchema = new Schema<ICourse>(
    {
        title: {
            type: String,
            required: true 
            },
        description: {
            type: String,
            required: true 
            },
        videos: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
            }],
    },
    { timestamps: true }
);

export default mongoose.model<ICourse>("Course", courseSchema);
