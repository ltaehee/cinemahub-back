const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      require: true,
      unique: true,
    },
    name: {
      type: String,
      require: true,
    },
    img: {
      type: String,
      default: '/images/thumbnail.svg',
    },
    role: {
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
