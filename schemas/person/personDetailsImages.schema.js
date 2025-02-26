const mongoose = require("mongoose");

const personDetailsImagesSchema = new mongoose.Schema({
  personId: { type: Number, required: true, unique: true },
  imgPath: [String],
  updatedAt: { type: Date, default: Date.now, index: { expires: "7d" } },
});

const PersonDetailsImages = mongoose.model(
  "PersonDetailsImages",
  personDetailsImagesSchema
);
module.exports = PersonDetailsImages;
