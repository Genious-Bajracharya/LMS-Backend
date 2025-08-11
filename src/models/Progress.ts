import mongoose, {  Schema } from "mongoose";

const progressSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    video: { type: Schema.Types.ObjectId, ref: "Video", required: true },
    watchedDuration: { type: Number, default: 0 },
    videoDuration: { type: Number, required: true },
    completed: { type: Boolean, default: false },
    
  },
  { timestamps: true }
);

export default mongoose.model("Progress", progressSchema);
