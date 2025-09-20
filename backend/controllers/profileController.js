import Profile from '../models/Profile.js';
import { deleteFile, fileExists } from '../utils/fileUtils.js';
import path from 'path';

// Create a new profile
export const createProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, location, linkedInUrl, portfolioUrl } = req.body;

    // Check if profile already exists
    const existingProfile = await Profile.findOne({ email });
    if (existingProfile) {
      return res.status(400).json({ error: 'Profile with this email already exists' });
    }

    const profile = new Profile({
      firstName,
      lastName,
      email,
      location,
      linkedInUrl,
      portfolioUrl
    });

    await profile.save();
    res.status(201).json(profile);
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get profile (since we're not implementing login yet, we'll get the most complete profile)
export const getProfile = async (req, res) => {
  try {
    // First try to get a profile with resume, then fall back to most recent
    let profile = await Profile.findOne({ resume: { $ne: null } }).sort({ updatedAt: -1 });
    
    if (!profile) {
      // If no profile with resume, get the most recent one
      profile = await Profile.findOne().sort({ createdAt: -1 });
    }
    
    if (!profile) {
      return res.status(404).json({ error: 'No profile found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, location, linkedInUrl, portfolioUrl } = req.body;

    // Find the profile (since we're not implementing login yet, we'll update the first/only profile)
    const profile = await Profile.findOne().sort({ createdAt: -1 });
    if (!profile) {
      return res.status(404).json({ error: 'No profile found' });
    }

    // Update fields
    profile.firstName = firstName || profile.firstName;
    profile.lastName = lastName || profile.lastName;
    profile.email = email || profile.email;
    profile.location = location || profile.location;
    profile.linkedInUrl = linkedInUrl || profile.linkedInUrl;
    profile.portfolioUrl = portfolioUrl || profile.portfolioUrl;

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete profile
export const deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne().sort({ createdAt: -1 });
    if (!profile) {
      return res.status(404).json({ error: 'No profile found' });
    }

    // Delete profile picture file if it exists
    if (profile.profilePicture) {
      const imagePath = path.join(process.cwd(), profile.profilePicture);
      if (await fileExists(imagePath)) {
        await deleteFile(imagePath);
      }
    }

    await Profile.findByIdAndDelete(profile._id);
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: error.message });
  }
};

// Upload profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    console.log('Upload request received:', {
      hasFile: !!req.file,
      fileInfo: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        filename: req.file.filename
      } : null
    });

    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Find the profile
    const profile = await Profile.findOne().sort({ createdAt: -1 });
    if (!profile) {
      console.log('No profile found');
      return res.status(404).json({ error: 'No profile found' });
    }

    console.log('Found profile:', profile._id);

    // Delete old profile picture if it exists
    if (profile.profilePicture) {
      const oldImagePath = path.join(process.cwd(), profile.profilePicture);
      if (await fileExists(oldImagePath)) {
        await deleteFile(oldImagePath);
        console.log('Deleted old profile picture');
      }
    }

    // Update profile with new picture path
    profile.profilePicture = `/uploads/profiles/${req.file.filename}`;
    await profile.save();

    console.log('Profile picture saved successfully:', profile.profilePicture);

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: profile.profilePicture
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ error: error.message });
  }
};

// Upload resume
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    console.log('Resume file uploaded:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Find existing profile or create new one
    let profile = await Profile.findOne();
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found. Please create a profile first.' });
    }

    // Delete old resume file if it exists
    if (profile.resume) {
      const oldResumeFile = path.join(process.cwd(), 'uploads', 'resumes', path.basename(profile.resume));
      if (await fileExists(oldResumeFile)) {
        await deleteFile(oldResumeFile);
      }
    }

    // Update profile with new resume path
    profile.resume = `/uploads/resumes/${req.file.filename}`;
    await profile.save();

    res.json({
      message: 'Resume uploaded successfully',
      resume: profile.resume
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: error.message });
  }
};
