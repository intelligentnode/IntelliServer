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
// views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


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

// ui
const chatUIRouter = require('./front/chat');


// # api routers
app.use('/', indexRouter);
// ui
app.use('/front/chat', chatUIRouter);

// secured apis
// admin
app.use('/admin', authAdminMiddleware, adminRouter);

// models
app.use('/openai', authMiddleware, openaiRouter);
app.use('/cohere', authMiddleware, cohereRouter);
app.use('/replicate', authMiddleware, replicateRouter);
app.use('/stability', authMiddleware, stabilityRouter);
app.use('/hugging', authMiddleware, huggingRouter);
// functions
app.use('/chatbot', authMiddleware, chatRouter);
app.use('/semanticsearch', authMiddleware, semanticRouter);
app.use('/evaluate', authMiddleware, evaluateRouter);

/* ### deploy the app ### */
var port = process.env.PORT || '80';
app.listen(port, function () {
    console.log('Your intelliServer is running on PORT: ' + port);
});

module.exports = app;
