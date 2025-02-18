const axios = require("axios");
require("dotenv").config();

const tmdbApi = axios.create({
  baseURL: process.env.TMDB_API_BASE_URL,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
  },
});

module.exports = { tmdbApi };
