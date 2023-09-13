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
// # middlwares
const authMiddleware = require('./middleware/auth');
const authAdminMiddleware = require('./middleware/authAdmin');

// # api
// remote models
const indexRouter = require('./api/routes/index');
const adminRouter = require('./api/routes/admin');
const openaiRouter = require('./api/models/remote/openai');
const cohereRouter = require('./api/models/remote/cohere');
const replicateRouter = require('./api/models/remote/replicate');
const stabilityRouter = require('./api/models/remote/stability');
const huggingRouter = require('./api/models/remote/hugging');
// functions
const chatRouter = require('./api/functions/chatbot');
const semanticRouter = require('./api/functions/semanticsearch');
const evaluateRouter = require('./api/functions/evaluate');
const parserRoute = require('./api/parser/index');


// # api routers
app.use('/', indexRouter);
// admin
app.use('/admin', authAdminMiddleware, adminRouter);


// secured apis
app.use(authMiddleware);
// models
app.use('/openai', openaiRouter);
app.use('/cohere', cohereRouter);
app.use('/replicate', replicateRouter);
app.use('/stability', stabilityRouter);
app.use('/hugging', huggingRouter);
// functions
app.use('/chatbot', chatRouter);
app.use('/semanticsearch', semanticRouter);
app.use('/evaluate', evaluateRouter);

// Routes
app.use('/parser', parserRoute)

/* ### deploy the app ### */
var port = process.env.PORT || '80';
app.listen(port, function () {
    console.log('Your intelliServer is running on PORT: ' + port);
});

module.exports = app;
