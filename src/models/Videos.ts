import mongoose, { Document, Schema } from "mongoose";

export interface IVideo extends Document {
    title: string;
    url: string;
    progress: number;
}

const videoSchema = new Schema<IVideo>(
    {
        title: {
            type: String,
            required: true 

        },
        url: {
            type: String,
            required: true 

        },
        progress: {
            type: Number,
            default: 0 
            },
    },
    { timestamps: true }
);

export default mongoose.model<IVideo>("Video", videoSchema);
