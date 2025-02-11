require('./db_init');
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('images', express.static('images'));
app.use(cookieParser());

app.use('/api', apiController);

module.exports = app;
