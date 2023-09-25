// load the config
require('dotenv').config();

// load the dependencies 
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const config = require('../config');
// swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger');

//create the app
var app = express();

/* ### initial config ### */
global.__basedir = path.join(__dirname, '..');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'))

/* ### the api routs ### */
// # middlwares
const authMiddleware = require('../middleware/auth');
const authAdminMiddleware = require('../middleware/authAdmin');

// # api
// remote models
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const openaiRouter = require('./models/remote/openai');
const cohereRouter = require('./models/remote/cohere');
const replicateRouter = require('./models/remote/replicate');
const stabilityRouter = require('./models/remote/stability');
const huggingRouter = require('./models/remote/hugging');
// functions
const chatRouter = require('./functions/chatbot');
const semanticRouter = require('./functions/semanticsearch');
const evaluateRouter = require('./functions/evaluate');
const chatContextRouter = require('./functions/chatcontext');
const parserRoute = require('./parser/index');


// # api routers

app.use('/', indexRouter);
// admin
app.use('/admin', authAdminMiddleware, adminRouter);
// swagger
if (config.SHOW_SWAGGER) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
        customCssUrl: '/stylesheets/swagger.css'
    }));
}

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
app.use('/chatcontext', chatContextRouter);

app.use('/parser', parserRoute)

/* ### deploy the app ### */
var port = process.env.PORT || '80';
app.listen(port, function () {
     console.log('Your intelliServer is running on PORT: ' + port);
});

module.exports = app;