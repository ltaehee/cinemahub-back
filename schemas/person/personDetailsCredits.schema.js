const mongoose = require("mongoose");

const PersonDetailsCreditsSchema = new mongoose.Schema({
  personId: { type: String, required: true },
  credits: [
    {
      movieId: { type: String, required: true },
      title: { type: String, required: true },
      releaseDate: String,
      posterPath: String,
      genreIds: [Number],
    },
  ],
});

const PersonDetailsCredits = mongoose.model(
  "PersonDetailsCredits",
  PersonDetailsCreditsSchema
);
module.exports = PersonDetailsCredits;
