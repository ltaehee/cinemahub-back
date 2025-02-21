const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

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
    introduce: {
      type: String,
      default: "",
    },
    profile: {
      type: String,
      default: "/images/thumbnail.svg",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    followers: [{ type: ObjectId, ref: "User" }],
    following: [{ type: ObjectId, ref: "User" }],
    favorites: [
      {
        favoriteType: {
          type: String,
          enum: ["Movie", "Person"],
          required: true,
        },
        favoriteId: {
          type: String,
          required: true,
          refPath: "favorites.favoriteType",
        },
      },
    ],
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: true,
    },
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
