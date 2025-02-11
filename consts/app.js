require("dotenv").config();
const PORT = 8080;

const FRONT_URL = process.env.FRONT_URL;

const MONGODB_URL = process.env.MONGODB_URL;

module.exports = {
  PORT,
  FRONT_URL,
  MONGODB_URL,
};
