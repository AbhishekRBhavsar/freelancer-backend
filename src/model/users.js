const mongoose = require('mongoose');

const setEmail = (email) => email.toLowerCase();

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  summary: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    set: setEmail,
  },
  password: {
    type: String,
  },
  googleAuth: {
    type: String,
  },
  facebookAuth: {
    type: String,
  },
  socialAuthId: {
    type: String,
  },
  role: {
    type: String,
    required: true,
    default: 'user',
    enum: ['user', 'admin'],
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  is2FA: {
    type: Boolean,
    required: true,
    default: false,
  },
  isArchived: {
    type: Boolean,
    required: true,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
}, {
  timestamps: true,
  versionKey: false,
});

// userSchema.index({ googleAuth: 1, email: 1 });

const Users = mongoose.model('Users', userSchema);
exports.Users = Users;
