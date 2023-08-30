// load the config
require('dotenv').config();

// load the dependencies 
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//create the app

var app = express();

/* ### initial config ### */
global.__basedir = __dirname;
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


/* ### the api routs ### */
// middlwares
const authMiddleware = require('./middleware/auth');
const authAdminMiddleware = require('./middleware/authAdmin');

// api
const indexRouter = require('./api/routes/index');
const adminRouter = require('./api/routes/admin');
const openaiRouter = require('./api/models/remote/openai');
const cohereRouter = require('./api/models/remote/cohere');

// root apis
app.use('/', indexRouter);

// admin
app.use('/admin', authAdminMiddleware, adminRouter);


// secured apis
app.use(authMiddleware);

app.use('/openai', openaiRouter);
app.use('/cohere', cohereRouter);


/* ### deploy the app ### */

module.exports = app;
