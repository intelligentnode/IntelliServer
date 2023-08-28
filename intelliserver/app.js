// load the config
require('dotenv').config();

// load the dependencies 
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//creat the app
var app = express();

/* ### initial config ### */

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


/* ### the api routs ### */

// api
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const openaiRouter = require('./remotes/openai');

// middlwares
const authMiddleware = require('./middleware/auth'); 
const authAdminMiddleware = require('./middleware/authAdmin');

// root apis
app.use('/', indexRouter);

// admin
app.use('/admin', authAdminMiddleware, adminRouter);


// secured apis
app.use(authMiddleware);

app.use('/openai', openaiRouter);


/* ### deploy the app ### */

module.exports = app;
