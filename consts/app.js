require("dotenv").config();
const PORT = 8080;

const FRONT_URL = process.env.FRONT_URL;
const MONGODB_URL = process.env.MONGODB_URL;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const TMDB_SEARCH_API_KEY = process.env.TMDB_SEARCH_API_KEY;

module.exports = {
  PORT,
  FRONT_URL,
  MONGODB_URL,
  JWT_SECRET_KEY,
  TMDB_SEARCH_API_KEY,
};
