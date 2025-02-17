const mongoose = require("mongoose");

const genreSchema = new mongoose.Schema({
  genres: {
    type: [Object],
    required: true,
  },
});

const Genre = mongoose.model("Genre", genreSchema);
module.exports = Genre;
