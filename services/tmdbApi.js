const axios = require("axios");

export const tmdbApi = axios.create({
  baseURL: process.env.TMDB_API_BASE_URL,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
  },
});
