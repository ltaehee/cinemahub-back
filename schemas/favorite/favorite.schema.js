const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
    favoriteType: {
      type: String,
      enum: ["Movie", "Actor", "Director"],
      required: true,
    },
    favoriteId: {
      type: ObjectId,
      required: true,
      refPath: "favoriteType",
    },
  },
  {
    timestamps: {
      createdAt: true,
    },
  }
);

const Favorite = mongoose.model("Favorite", favoriteSchema);
module.exports = Favorite;
