const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  about: {
    type: String,
  },
  image: {
    type: String,
  },
  website: {
    type: String,
  },
  location: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  skills: [
    {
      type: String,
      default: [],
    },
  ],
  budget: {
    type: Number,
  },
  duration: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
  },
  position: {
    type: String,
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract'],
  },
  hourlyRate: {
    type: Number,
  },
  location: {
    type: String,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Jobs = mongoose.model('Jobs', jobSchema);
const Organization = mongoose.model('Organization', organizationSchema);

exports.Jobs = Jobs;
exports.Organization = Organization;
