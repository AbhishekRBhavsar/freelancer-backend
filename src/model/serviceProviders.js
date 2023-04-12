const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
});

const educationSchema = new mongoose.Schema({
  school: {
    type: String,
  },
  degree: {
    type: String,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
});

const experienceSchema = new mongoose.Schema({
  company: {
    type: String,
  },
  position: {
    type: String,
  },
  description: {
    type: String,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
});

const serviceProvider = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
    unique: true,
  },
  technologies: [
    {
      type: String,
      default: [],
    },
  ],
  languages: [
    {
      type: String,
      default: [],
    },
  ],
  libsAndPackages: [
    {
      type: String,
      default: [],
    },
  ],
  frameworks: [
    {
      type: String,
      default: [],
    },
  ],
  databases: [
    {
      type: String,
      default: [],
    },
  ],
  projects: [
    { type: projectSchema },
  ],
  education: [
    { type: educationSchema },
  ],
  experience: [
    { type: experienceSchema },
  ],
}, {
  timestamps: true,
  versionKey: false,
});

// userSchema.index({ googleAuth: 1, email: 1 });

const ServiceProviders = mongoose.model('ServiceProviders', serviceProvider);
exports.ServiceProviders = ServiceProviders;
