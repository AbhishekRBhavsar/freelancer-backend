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

const clientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
    unique: true,
  },
  projects: [
    { type: projectSchema },
  ],
  // education: [
  //   { type: educationSchema },
  // ],
  experience: [
    { type: experienceSchema },
  ],
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
  }
}, {
  timestamps: true,
  versionKey: false,
});

const Clients = mongoose.model('Clients', clientSchema);
exports.Clients = Clients;
