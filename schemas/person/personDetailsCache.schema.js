const mongoose = require("mongoose");

const personDetailsCacheSchema = new mongoose.Schema({
  personId: { type: Number, required: true, unique: true },
  imgPath: [String],
  birthday: { type: String },
  deathday: { type: String | null },
  gender: Number,
  department: String,
  placeOfBirth: String,
});

module.exports = mongoose.model(
  "PersonDetailsCacheSchema",
  personDetailsCacheSchema
);
