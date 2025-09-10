// Video schema (title, url, views, uniqueViewers, etc.)
import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    shareId: { 
        type: String,
        required: true,
        unique: true 
    }, 
    viewCount: {
        type: Number,
        default: 0 
    }, // total views
    uniqueViewers: { 
        type: [String], 
        default: [] 
    }, // UUIDs from localStorage
    lastViewed: { 
        type: Date 
    }, // last view timestamp
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);

const Video = mongoose.model("Video", videoSchema);
export default Video;

