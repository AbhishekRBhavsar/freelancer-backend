const mongoose = require('mongoose');

const userLogsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['developer', 'client'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  versionKey: false,
});

const UserLogs = mongoose.model('UserLogs', userLogsSchema);

exports.UserLogs = UserLogs;
