const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const followSchema = new mongoose.Schema(
  {
    userTo: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
    userFrom: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: {
      createdAt: true,
    },
  }
);

const Follow = mongoose.model("Follow", followSchema);
module.exports = Follow;
