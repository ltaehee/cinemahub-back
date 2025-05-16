const { SESSION_NAME, SESSION_SECRET_KEY } = require('./consts/app');
require('./db_init');
const apiController = require('./controllers');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');

require('./services/movie/movie.service');
require('./services/person/fetchPopularActors.service');
const MemoryStore = require('memorystore')(session);

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://web-cinemahub-front-m88gjvsd5fb295a9.sel4.cloudtype.app',
    ],
    credentials: true,
  })
);

app.set('trust proxy', 1);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const isProduction = process.env.NODE_ENV === 'production';
console.log('isProduction', isProduction);
app.use(
  session({
    name: SESSION_NAME,
    secret: SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: new MemoryStore({
      checkPeriod: 24 * 60 * 60 * 1000,
    }),

    cookie: {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? 'None' : 'Lax',
    },
  })
);

app.use('images', express.static('images'));
app.use('/api', apiController);

app.get('/', (req, res) => {
  res.status(200).send('Backend is running!');
});
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Health check successful!' });
});

module.exports = app;
