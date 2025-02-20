// const mypageRoutes = require('./routes/mypage/mypage.route');
require('./db_init');
const apiController = require('./controllers');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { SESSION_NAME, SESSION_SERECT_KEY } = require('./consts/app');
require('./services/movie/movie.service');
require('./services/person/fetchPopularActors.service');
const MemoryStore = require('memorystore')(session);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    name: SESSION_NAME,
    secret: SESSION_SERECT_KEY,
    resave: 'false',
    saveUninitialized: true,
    store: new MemoryStore({
      checkPeriod: 24 * 60 * 60 * 1000,
    }),
  })
);

app.use('images', express.static('images'));
app.use(cookieParser());

// app.use('/api/mypage', mypageRoutes);
app.use('/api', apiController);

module.exports = app;
