require("dotenv").config();

const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Mongodb Connected"))
  .catch((err) => {
    console.log("(!)Fail to connect", err);
  });

module.exports = mongoose;
