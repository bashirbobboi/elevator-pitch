import express from 'express';
import multer from 'multer';
import Profile from '../models/Profile.js';
import {
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
  uploadProfilePicture,
  uploadResume
} from '../controllers/profileController.js';
import { resumeUpload } from '../config/multer.js';

const router = express.Router();

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `profile-${uniqueSuffix}-${cleanName}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 30 * 1024 * 1024 // 30MB limit
  }
});

// Profile routes
router.post('/', createProfile);
router.get('/', getProfile);
router.put('/', updateProfile);
router.delete('/', deleteProfile);

// Debug route to see all profiles
router.get('/debug/all', async (req, res) => {
  try {
    const profiles = await Profile.find({}).sort({ createdAt: -1 });
    res.json({
      count: profiles.length,
      profiles: profiles.map(p => ({
        _id: p._id,
        email: p.email,
        firstName: p.firstName,
        lastName: p.lastName,
        createdAt: p.createdAt,
        hasProfilePicture: !!p.profilePicture,
        hasResume: !!p.resume
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Profile picture upload route
router.post('/upload-picture', (req, res, next) => {
  upload.single('profilePicture')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, uploadProfilePicture);

// Resume upload route
router.post('/upload-resume', (req, res, next) => {
  resumeUpload.single('resume')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, uploadResume);

export default router;
