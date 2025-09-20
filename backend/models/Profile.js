import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  linkedInUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'LinkedIn URL must be a valid URL'
    }
  },
  portfolioUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Portfolio URL must be a valid URL'
    }
  },
  profilePicture: {
    type: String, // Path to the uploaded image file
    default: null
  },
  resume: {
    type: String, // Path to the uploaded resume file
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
profileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Profile', profileSchema);
