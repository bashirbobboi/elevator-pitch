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
    firstViewed: {
        type: Date
    }, // when pitch was first opened
    viewerSessions: {
        type: Map,
        of: String,
        default: new Map()
    }, // Track viewer sessions to prevent duplicate views
    // Advanced Analytics
    watchDuration: {
        type: Map,
        of: Number,
        default: new Map()
    }, // viewerId -> seconds watched
    completionRate: {
        type: Number,
        default: 0
    }, // percentage of viewers who reached 90s
    resumeDownloads: {
        type: Number,
        default: 0
    }, // how many times resume was downloaded
    portfolioClicks: {
        type: Number,
        default: 0
    }, // portfolio button clicks
    linkedinClicks: {
        type: Number,
        default: 0
    }, // linkedin button clicks
    viewerAnalytics: [{
        viewerId: String,
        firstView: Date,
        lastView: Date,
        totalWatchTime: { type: Number, default: 0 },
        completedVideo: { type: Boolean, default: false },
        resumeDownloaded: { type: Boolean, default: false },
        portfolioClicked: { type: Boolean, default: false },
        linkedinClicked: { type: Boolean, default: false }
    }]
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);

const Video = mongoose.model("Video", videoSchema);
export default Video;

