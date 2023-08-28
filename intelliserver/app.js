var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

/* ### initial config ### */

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


/* ### the api routs ### */

var indexRouter = require('./routes/index');
var openaiRouter = require('./remotes/openai');

app.use('/', indexRouter);
app.use('/openai', openaiRouter);

module.exports = app;
