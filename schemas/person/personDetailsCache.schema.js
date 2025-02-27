const mongoose = require("mongoose");

const personDetailsCacheSchema = new mongoose.Schema({
  personId: { type: String, required: true, unique: true },
  name: String,
  profilePath: String,
  birthday: String,
  deathday: { type: String, default: null },
  gender: Number,
  department: String,
  placeOfBirth: String,
  updatedAt: { type: Date, default: Date.now, index: { expires: "7d" } },
});

module.exports = mongoose.model(
  "PersonDetailsCacheSchema",
  personDetailsCacheSchema
);
