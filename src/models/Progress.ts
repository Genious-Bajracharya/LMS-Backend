import mongoose, { Document, Schema } from "mongoose";

export interface IProgress extends Document {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  video: mongoose.Types.ObjectId;
  watchedDuration: number; // seconds watched
  videoDuration: number;   // total seconds of video
  completed: boolean;
}

const progressSchema = new Schema<IProgress>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    video: { type: Schema.Types.ObjectId, ref: "Video", required: true },
    watchedDuration: { type: Number, default: 0 },
    videoDuration: { type: Number, required: true },
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model<IProgress>("Progress", progressSchema);
