const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      require: true,
      unique: true,
    },
    nickname: {
      type: String,
      require: true,
    },
    profile: {
      type: String,
      default: '/images/thumbnail.svg',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: {
      createdAt: true,
    },
  }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
