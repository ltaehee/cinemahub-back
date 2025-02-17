require("./db_init");
const apiController = require("./controllers");
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
require("./services/movie/movie.service");
require("./services/person/fetchPopularActors.service");
const MemoryStore = require("memorystore")(session);

const mypageRoutes = require("./routes/mypage/mypage.route");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    name: "cinamahub",
    secret: "cinamahub serect key",
    resave: "false",
    saveUninitialized: true,
    store: new MemoryStore({
      checkPeriod: 24 * 60 * 60 * 1000,
    }),
  })
);

app.use("images", express.static("images"));
app.use(cookieParser());

// const checker = (req, res, next) => {
//   console.log(req.session.id);
//   req.next();
// };

app.use("/api", apiController);

app.use("/api/mypage", mypageRoutes);

module.exports = app;
