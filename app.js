require('./db_init');
const apiController = require('./controllers');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: 'cinamahub',
    resave: 'false',
    saveUninitialized: true,
    store: new MemoryStore({
      checkPeriod: 24 * 60 * 60 * 1000,
    }),
  })
);

app.use('images', express.static('images'));
app.use(cookieParser());

// const checker = (req, res, next) => {
//   console.log(req.session.id);
//   req.next();
// };

app.use('/api', apiController);

module.exports = app;
