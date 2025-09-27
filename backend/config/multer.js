import multer from "multer";
import path from "path";
import { videoStorage, resumeStorage, profileStorage } from './cloudinary.js';

// Use Cloudinary storage for production, local storage for development
const useCloudinary = process.env.NODE_ENV === 'production' || process.env.USE_CLOUDINARY === 'true';

// Configure storage for videos
const videoStorageConfig = useCloudinary ? videoStorage : multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // save in uploads folder
  },
  filename: (req, file, cb) => {
    // Create unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    // Remove spaces and special characters from filename
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, uniqueSuffix + "-" + cleanName);
  }
});

// Configure storage for resumes
const resumeStorageConfig = useCloudinary ? resumeStorage : multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/resumes/"); // save in uploads/resumes folder
  },
  filename: (req, file, cb) => {
    // Create unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    // Remove spaces and special characters from filename
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, uniqueSuffix + "-" + cleanName);
  }
});

// Configure storage for profile pictures
const profileStorageConfig = useCloudinary ? profileStorage : multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profiles/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `profile-${uniqueSuffix}-${cleanName}`);
  }
});

// File filter to only allow video files
const videoFileFilter = (req, file, cb) => {
  // Check if file is a video
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed!'), false);
  }
};

// File filter to only allow PDF files
const resumeFileFilter = (req, file, cb) => {
  // Check if file is a PDF
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

// Configure multer for videos
const videoUpload = multer({ 
  storage: videoStorageConfig,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Configure multer for resumes
const resumeUpload = multer({ 
  storage: resumeStorageConfig,
  fileFilter: resumeFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Configure multer for profile pictures
const profileUpload = multer({
  storage: profileStorageConfig,
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export default videoUpload;
export { resumeUpload, profileUpload };
