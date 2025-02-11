require('./db_init');
const apiController = require('./controllers');
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('images', express.static('images'));
app.use(cookieParser());

app.use('/api', apiController);

module.exports = app;
