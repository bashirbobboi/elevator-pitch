import express from "express";
import {
  createVideo,
  getVideos,
  getVideoById,
  getVideoByShareId,
} from "../controllers/videoController.js";

const router = express.Router();

router.post("/", createVideo);       // create video
router.get("/", getVideos);          // get all videos
router.get("/:id", getVideoById);    // get by Mongo _id
router.get("/share/:shareId", getVideoByShareId); // 👈 get by shareId

export default router;
